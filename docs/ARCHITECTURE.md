# OpenClaw Personal Overlay — 架构文档

> 本文档详细记录 openclaw-personal-overlay 的设计目的、实现方式、开发流程和部署验证要点。

## 1. 项目概述

### 什么是 openclaw-personal-overlay

openclaw-personal-overlay 是一个轻量级补丁系统，用于在不修改 OpenClaw 主包的前提下，通过覆盖 `dist/` 目录中的编译产物实现定制功能。

### 为什么需要 Overlay

1. **不 Fork 官方仓库** — 减少维护负担，避免与上游产生大量冲突
2. **保留升级能力** — 用户可以正常运行 `npm update openclaw`，overlay 只在兼容版本上生效
3. **版本锁定** — 通过 `openclawVersion + commitSha` 精确匹配，防止不兼容的补丁被误用
4. **差异化分发** — 只打包修改过的文件（diff overlay），减小分发体积

### 支持的 OpenClaw 版本

当前 overlay 支持 OpenClaw `v2026.3.7`（commit `42a1394c5c0fb86706f61598e68e0db30e8c99c1`）。

兼容矩阵见 `compatibility.json`，每个条目包含：
- `openclawVersion`: 目标 OpenClaw 版本号
- `commitSha`: 目标 commit SHA（40 字符）
- `overlayHeadCommit`: overlay 构建时的 commit
- `patchSetDir`: 对应的 patch 目录
- `binaryArtifact`: 对应的二进制产物名

---

## 2. 七个功能要点

### 2.1 Exec Guard（主会话 exec 拦截）

**设计目的**：防止主会话执行长时间运行的命令阻塞整个会话，强制使用 `sessions_spawn` 派生子会话。

**实现方式**：在 `bash-tools.exec.ts` 的 `createExecTool.execute()` 入口处添加 `checkMainSessionPolicy` 函数检查。

**代码位置**：
- 源文件：`packages/openclaw/src/reply/bash-tools.exec.ts`
- 关键函数：`checkMainSessionPolicy()`、`enforceMainSessionPolicy()`

**行为**：
- 检测当前是否为主会话（`session.id === 'main'` 或类似逻辑）
- 主会话执行 exec 时返回错误：`"Main session policy blocked exec. Use sessions_spawn to run in a subagent."`
- 子会话不受影响

### 2.2 SSH Block（主会话 SSH 命令拦截）

**设计目的**：阻止主会话执行 SSH/SCP/SFTP/rsync 等可能导致长时间挂起或安全风险的命令。

**实现方式**：同 exec guard，在 `checkMainSessionPolicy` 中检测命令是否匹配 SSH 命令家族。

**代码位置**：同 2.1

**检测模式**：
```javascript
const SSH_COMMANDS = ['ssh', 'scp', 'sftp', 'rsync'];
function isSshCommand(cmd) {
  return SSH_COMMANDS.some(c => cmd.startsWith(c + ' ') || cmd === c);
}
```

### 2.3 Output Cap（主会话输出限制）

**设计目的**：限制主会话的命令输出字节数（默认 50KB），防止输出爆炸导致 token 耗尽或响应超时。

**实现方式**：在主会话 exec 返回结果时截断超长输出。

**代码位置**：`packages/openclaw/src/reply/bash-tools.exec.ts`

**默认阈值**：50KB（51200 bytes）

### 2.4 Control Fast-Path（控制命令快速通道）

**设计目的**：确保 `/status`、`/stop`、`/model` 等控制命令在主会话繁忙时仍能立即响应，不被 session lane 队列阻塞。

**实现方式**：修改 `sequential-key.ts`，为所有斜杠命令分配独立的 sequential key `:control`，使其绑定到单独的处理队列。

**代码位置**：`packages/openclaw/src/reply/sequential-key.ts`

**效果**：
- 常规消息排队等待处理
- 控制命令走 `:control` 通道，立即执行

### 2.5 Abortable Retry（可中断重试）

**设计目的**：使瞬态错误重试的 sleep 可被中断，允许用户发送 `/stop` 时立即终止等待。

**实现方式**：v2026.3.7 已内置 `sleepWithAbort` 函数，无需 patch。

**代码位置**：上游已实现（`packages/openclaw/src/reply/sleep.ts`）

**状态**：✅ 内置，无需 overlay

### 2.6 Sub-Agent Timeout（子会话超时）

**设计目的**：将默认子会话超时从上游较短的值（如 1800s）延长到 6 小时（21600s），适应复杂任务需要。

**实现方式**：修改 `subagent-spawn.ts` 中的 `DEFAULT_TIMEOUT_SECONDS` 常量。

**代码位置**：`packages/openclaw/src/reply/subagent-spawn.ts`

**修改**：
```javascript
const DEFAULT_TIMEOUT_SECONDS = 21600; // 6 hours
```

### 2.7 PERSONAL BUILD 标识

**设计目的**：在 Telegram `/status` 和 CLI `openclaw status` 输出中显示 `PERSONAL BUILD` 标识，方便识别是否应用了 overlay。

**实现方式**：
- Telegram status：修改 `packages/openclaw/src/reply/status.ts`
- CLI status：修改 `packages/openclaw/src/daemon-cli/status.print.ts`

**代码位置**：
- `packages/openclaw/src/reply/status.ts`
- `packages/openclaw/src/daemon-cli/status.print.ts`

**输出示例**：
```
Gateway: running (PERSONAL BUILD 2026-03-08)
```

---

## 3. 开发流程

### 源码位置

开发时使用临时目录克隆 OpenClaw 源码：
```bash
/tmp/overlay-fresh/openclaw-src
```

Checkout 目标版本：
```bash
cd /tmp/overlay-fresh/openclaw-src
git checkout v2026.3.7
```

### Patch 流程

1. **修改源码**：在源码目录中进行修改
2. **生成 patch**：
   ```bash
   git format-patch v2026.3.7 --stdout > ~/openclaw-personal-overlay/patches/0001-my-change.patch
   ```
   或批量生成：
   ```bash
   git format-patch v2026.3.7 -o ~/openclaw-personal-overlay/patches/
   ```
3. **存入 patches 目录**：按编号命名（0001-, 0002-, ...）

### 构建

```bash
cd /tmp/overlay-fresh/openclaw-src
pnpm install
pnpm build
```

### 打包

使用 `scripts/build-dist-overlay.sh` 打包：
```bash
./scripts/build-dist-overlay.sh /tmp/overlay-fresh/openclaw-src dist-overlay
```

**关键点**：
- 只提取修改过的 dist 文件（主要是 `reply-*.js` chunk）
- 合并 baseline dist 保证导出完整性
- 生成 `metadata.json` 和 `checksums.sha256`

### 发布

```bash
# 打包 tar.gz
tar czf dist-overlay.tar.gz -C dist-overlay .

# 计算校验和
sha256sum dist-overlay.tar.gz > dist-overlay.tar.gz.sha256

# 创建 GitHub Release
gh release create overlay-v2026.3.7 dist-overlay.tar.gz dist-overlay.tar.gz.sha256
```

---

## 4. Overlay Tar 包结构

```
dist-overlay/
├── metadata.json          # overlay 元数据
├── checksums.sha256       # payload 文件校验和
└── payload/
    └── dist/
        ├── reply-XXXX.js  # 修改过的 chunk 文件
        └── ...            # 其他必要文件
```

### metadata.json 格式

```json
{
  "format": "openclaw-personal-dist-overlay/v1",
  "overlayVersion": "overlay-v2026.3.7",
  "targetOpenclawVersion": "2026.3.7",
  "targetCommitSha": "42a1394c5c0fb86706f61598e68e0db30e8c99c1",
  "builtAt": "2026-03-08T15:18:00Z",
  "features": [
    "PERSONAL_BUILD_tag_in_status",
    "subagent_default_timeout_6h",
    "main_session_exec_block_v10"
  ],
  "notes": "..."
}
```

### 重要约束

1. **不能包含 entry.js**
   - 原因：jiti 插件加载时会把 `index.js` 当目录处理，包含 `entry.js` 会破坏插件加载机制
   - CI 验证：`validate-overlay.yml` 检查无 `entry.js`

2. **index.js 只在必要时包含**
   - 当 reply chunk 的 hash 变更导致 index.js 中的引用需要更新时才包含
   - 当前 overlay 是 diff overlay，只包含修改的文件

3. **必须保证导出完整性**
   - 使用 baseline + patch merge 方式构建
   - `validate-dist-exports.sh` 验证 `plugin-sdk` 导出完整

---

## 5. Apply 流程

### `bin/openclaw-personal apply` 完整逻辑

```
┌─────────────────────────────────────────────────────────┐
│ 1. 检测本地 OpenClaw 安装                                │
│    - 通过 which openclaw 定位安装目录                    │
│    - 读取 package.json 获取版本号                        │
│    - 计算 dist 目录的 commitSha                          │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│ 2. 从 compatibility.json 匹配支持版本                    │
│    - 比对 openclawVersion + commitSha                   │
│    - 不匹配则报错退出（E_INCOMPATIBLE）                  │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│ 3. 从 GitHub Release 下载 dist-overlay.tar.gz           │
│    - 默认仓库：dddabtc/openclaw-personal-overlay        │
│    - 也可指定本地路径或 URL                              │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│ 4. 备份当前 dist                                         │
│    - 保存到 ~/.local/state/openclaw-personal-overlay/   │
│    - 记录 install-state.json                            │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│ 5. 解压 payload/dist/* 到 OpenClaw dist 目录             │
│    - 覆盖对应文件                                        │
│    - 保留未修改的文件                                    │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│ 6. 设置 agents.defaults.timeoutSeconds=21600            │
│    - 通过 openclaw config set 命令                       │
│    - 确保子会话使用 6 小时超时                           │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│ 7. 输出成功信息                                          │
│    - 提示重启 gateway：openclaw gateway restart          │
└─────────────────────────────────────────────────────────┘
```

### Rollback 逻辑

```bash
bin/openclaw-personal rollback
```

1. 读取 `install-state.json` 获取备份位置
2. 从备份恢复原始 dist 文件
3. 清理 install state
4. 提示重启 gateway

---

## 6. 配置文件

### compatibility.json

```json
{
  "schema": 3,
  "project": "openclaw-personal-overlay",
  "generatedAt": "2026-02-21T04:17:00Z",
  "channels": {
    "source": {
      "enabled": true,
      "applyScript": "scripts/apply-personal-patch.sh",
      "rollbackScript": "scripts/rollback-personal-patch.sh"
    },
    "binary": {
      "enabled": true,
      "artifactName": "dist-overlay.tar.gz",
      "installStateFile": "~/.local/state/openclaw-personal-overlay/install-state.json"
    }
  },
  "supported": [
    {
      "id": "oc-2026.3.7-personal-overlay",
      "openclawVersion": "2026.3.7",
      "commitSha": "42a1394c5c0fb86706f61598e68e0db30e8c99c1",
      "upstreamBaseCommit": "42a1394c5c0fb86706f61598e68e0db30e8c99c1",
      "overlayHeadCommit": "a37d4949b",
      "patchSetDir": "patches/e7b600e31882-autocompat",
      "binaryArtifact": "dist-overlay.tar.gz",
      "atlasCompat": {
        "memory_search": "expected",
        "memory_get": "expected"
      },
      "notes": "...",
      "status": "supported"
    }
  ]
}
```

### metadata.json 格式要求

- `overlayVersion` 必须以 `overlay-v` 开头
- `targetOpenclawVersion` 必须与 compatibility.json 中的版本匹配
- `targetCommitSha` 必须是 40 字符的完整 SHA

### 113 的 AGENTS.md exec guard 响应规则

在 113（192.168.1.113 WSL2）的 `AGENTS.md` 中配置：

```markdown
## Exec Policy

当收到 "Main session policy blocked exec" 错误时：
1. 不要重试 exec
2. 立即使用 sessions_spawn 创建子会话执行任务
3. 等待子会话完成后汇报结果
```

---

## 7. CI 设计

### validate-overlay.yml

**目的**：验证 overlay tar 包的完整性和正确性

**验证步骤**：
1. **提取 overlay**：解压 `dist-overlay.tar.gz`
2. **验证 metadata.json**：检查 `overlayVersion` 以 `overlay-v` 开头
3. **验证无 entry.js**：确保不包含会破坏 jiti 加载的 entry.js
4. **验证 checksums**：校验 `checksums.sha256`
5. **验证特征字符串**：检查 reply chunk 包含关键实现：
   - `PERSONAL BUILD`
   - `enforceMainSessionPolicy`
   - `sessions_spawn`（错误消息中）
   - `isSshCommand` / SSH block
   - `21600`（子会话超时）

### 其他 CI 工作流

| 工作流 | 目的 |
|--------|------|
| `ci.yml` | 基础 CI：lint、test、构建验证 |
| `auto-compat.yml` | 检测上游新版本，自动 rebase patch，验证兼容性 |
| `release.yml` | 发布流程：构建、验证、创建 GitHub Release |
| `auto-review-merge.yml` | 自动审核和合并 PR |

---

## 8. 验证要点（部署后检查清单）

### 自动化验证

- [ ] `bin/openclaw-personal apply` 自动下载并应用成功
- [ ] `openclaw gateway restart` 后 gateway running

### 功能验证

- [ ] `/status` 显示 `PERSONAL BUILD` 和正确日期
- [ ] 主会话 exec 被拦截（返回 "Main session policy blocked"）
- [ ] `/status` 在主会话繁忙时仍能立即响应（control fast-path）
- [ ] AI 收到 exec blocked 后立即调用 `sessions_spawn`

### 技术验证

- [ ] reply chunk 中包含 `checkMainSessionPolicy`（grep 计数 > 0）
- [ ] reply chunk 中包含 `PERSONAL BUILD`（grep 计数 > 0）
- [ ] reply chunk 中包含 `21600`（grep 计数 > 0）

### 验证命令

```bash
# 检查 PERSONAL BUILD 标识
openclaw status | grep -i "PERSONAL BUILD"

# 检查 reply chunk 特征
REPLY=$(ls ~/.nvm/versions/node/*/lib/node_modules/openclaw/dist/reply-*.js | head -1)
grep -c "checkMainSessionPolicy" "$REPLY"
grep -c "PERSONAL BUILD" "$REPLY"
grep -c "21600" "$REPLY"
```

---

## 9. 已知问题和注意事项

### npm 包与源码编译的差异

npm 包安装的 OpenClaw 和从源码编译的版本，chunk 文件名（hash）可能不同。这是因为：
- bundler 使用文件内容 hash 生成文件名
- 不同环境的 build 可能产生略微不同的输出

**应对**：overlay 针对 npm 包版本构建，不直接适用于源码编译版本。

### Bundler Chunk 分割

bundler 可能将相关函数拆分到不同的 chunk 文件中。必须验证关键函数在同一个 reply chunk：
- `checkMainSessionPolicy`
- `enforceMainSessionPolicy`
- `isSshCommand`

**验证方法**：
```bash
grep -l "checkMainSessionPolicy" dist/reply-*.js
grep -l "isSshCommand" dist/reply-*.js
```

### 113 环境

- 113 是 WSL2 on 192.168.1.113
- SSH 连接：`ssh zhaod@192.168.1.113` 或 `bash scripts/ssh-113.sh`
- 该环境用于测试 overlay 应用

### Overlay Tar 结构

overlay tar 结构必须严格匹配 apply 脚本期望的格式：
```
dist-overlay/
  metadata.json
  checksums.sha256
  payload/
    dist/
      ...
```

任何结构变化都需要同步更新 `bin/openclaw-personal` 的解压逻辑。

---

## 10. Bug 修复记录

### 2026-03-08: index.js 必须包含在 overlay 中

**问题**：overlay 只包含 `reply-jwObgEFa.js` 但没有 `index.js`。由于 baseline 的 `index.js` 引用旧的 `reply-C5LKjXcC.js`，新的 reply chunk 永远不会被加载。导致 PERSONAL BUILD 不显示，exec guard 不生效。

**根因**：构建脚本的差异检测逻辑将 `reply-jwObgEFa.js` 标记为"new file"（因为 baseline 里的是 `reply-C5LKjXcC.js`，文件名不同），而默认 `INCLUDE_NEW_DIST_FILES=0`，所以新文件被跳过。

**修复**：
1. 手动确保 `index.js` 和新的 `reply-*.js` 都包含在 overlay 中
2. 添加 CI 验证步骤：`Validate index.js present`
3. CI 检查 `index.js` 引用的 reply chunk 是否存在于 overlay 中

**教训**：当 bundler 生成的 chunk 文件名（hash）变化时，`index.js` 必须一起更新。Diff overlay 必须包含引用关系完整的文件集合。

---

## 11. 关键决策记录

### 选择 Overlay 方式而非 Fork

**决策**：使用 overlay 覆盖而非 fork 官方仓库

**原因**：
- 减少维护负担：不需要持续跟踪上游变化
- 保留升级能力：用户可以正常升级 OpenClaw
- 精确控制：只在兼容版本上生效

### 不包含 entry.js

**决策**：overlay 中不包含 `entry.js`

**原因**：jiti 插件系统会把 `index.js` 当目录处理。如果 overlay 包含 `entry.js`，会破坏插件加载机制，导致所有 extension 报错。

**参考**：`POSTMORTEM.md` 记录了相关问题的完整分析。

### Exec Guard 用简单 Error Return

**决策**：主会话 exec 被拦截时返回错误，而非自动转发到子会话

**原因**：
- 更可靠：避免自动转发带来的复杂性
- 更透明：让 AI 明确知道需要使用 `sessions_spawn`
- 更可控：AI 可以决定如何处理（是否派生、派生到哪里）

### 使用 Opus 模型构建 Patch

**决策**：使用 Opus 模型而非 Codex 生成 patch

**原因**：Codex 生成的 patch 语法正确但运行时不生效。Opus 模型能更好地理解 TypeScript/JavaScript 运行时行为，生成功能正确的 patch。

---

## 附录 A：文件清单

```
openclaw-personal-overlay/
├── bin/
│   └── openclaw-personal        # 主命令行工具
├── compatibility.json           # 兼容性矩阵
├── dist-overlay/                # 构建产物目录
│   ├── metadata.json
│   ├── checksums.sha256
│   └── payload/dist/
├── dist-overlay.tar.gz          # 打包的发布产物
├── docs/
│   ├── ARCHITECTURE.md          # 本文档
│   ├── DEVELOPER_GUIDE.md       # 开发者指南
│   ├── IMPLEMENTATION.md        # 实现计划
│   └── REGULAR_USER_GUIDE.md    # 用户指南
├── patches/                     # Patch 文件目录
│   ├── 0001-*.patch
│   ├── 0002-*.patch
│   └── ...
├── scripts/
│   ├── apply-personal-patch.sh  # 源码模式 apply
│   ├── build-dist-overlay.sh    # 构建 overlay
│   ├── rollback-personal-patch.sh
│   ├── validate-compatibility.py
│   ├── validate-dist-exports.sh
│   └── validate-release.sh
├── .github/workflows/
│   ├── auto-compat.yml
│   ├── ci.yml
│   ├── release.yml
│   └── validate-overlay.yml
├── CHANGELOG.md
├── CONTRIBUTING.md
├── POSTMORTEM.md
└── README.md
```

---

## 附录 B：快速参考

### 常用命令

```bash
# 检查状态
bin/openclaw-personal status

# 应用 overlay
bin/openclaw-personal apply

# 回滚
bin/openclaw-personal rollback

# 重启 gateway
openclaw gateway restart
```

### 开发命令

```bash
# 从源码构建
cd /tmp/overlay-fresh/openclaw-src
pnpm build

# 打包 overlay
./scripts/build-dist-overlay.sh /tmp/overlay-fresh/openclaw-src dist-overlay

# 验证 overlay
tar xzf dist-overlay.tar.gz -C /tmp/test-extract
./scripts/validate-dist-exports.sh /tmp/test-extract/dist-overlay/payload 2026.3.7
```

### 调试命令

```bash
# 检查 reply chunk 特征
REPLY=$(ls dist-overlay/payload/dist/reply-*.js | head -1)
grep -c "checkMainSessionPolicy" "$REPLY"
grep -c "PERSONAL BUILD" "$REPLY"
grep -c "21600" "$REPLY"
grep -c "isSshCommand" "$REPLY"
```

---

*文档版本：2026-03-08*
*对应 Overlay 版本：overlay-v2026.3.7*
