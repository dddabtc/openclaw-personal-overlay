# openclaw-personal-overlay

[![overlay-ci](https://github.com/dddabtc/openclaw-personal-overlay/actions/workflows/overlay-ci.yml/badge.svg)](https://github.com/dddabtc/openclaw-personal-overlay/actions/workflows/overlay-ci.yml)
[![Release](https://img.shields.io/github/v/release/dddabtc/openclaw-personal-overlay)](https://github.com/dddabtc/openclaw-personal-overlay/releases)

OpenClaw 的个人 Overlay 补丁层：
- **Base**：官方 OpenClaw
- **Overlay**：本仓库维护的个人行为补丁

目标：持续跟进上游版本，同时保留个人行为定制；尽量不维护长期私有 fork。

---

## 这个仓库解决什么问题

- 上游更新快，个人补丁容易失效
- 手工 cherry-pick/rebuild 成本高
- 需要“能快速应用，也能安全回滚”的稳定流程

本仓库提供：
- 兼容门禁（`openclawVersion + commitSha`）
- `status / apply / rollback` 一键操作
- 不兼容时 fail-safe 退出（避免误改安装）

---

## 近期关键更新（与最新提交同步）

1. **`overlay-v2026.3.2` 能力补齐**（`6792dbc` + 后续修复）
   - README/CHANGELOG 同步了 `maxOutputBytes` 策略、发布资产硬门禁、构建与发布链路修复
   - 对应版本标签与 release 资产发布已纳入当前自动化流程

2. **apply 下载与版本匹配更稳**（`7f61ebb`, `04f419c`）
   - 增加非 `gh` 场景下载 fallback
   - 强化目标版本覆盖与 metadata 处理，避免参数过长导致 apply 失败

3. **配置补丁与默认策略收敛**（`987320a`, `e129e52`, `018a0c4`, `573b2c4`, `28706df`）
   - 去除上游不再支持的 `sessionPolicies` 注入
   - apply/rollback 期间显式设置并恢复 `agents.defaults.timeoutSeconds`
   - 默认主会话策略改为 `forbidLongExec` 并修复对应补丁编译/分片问题

4. **主会话执行保护扩大到全部非子会话**（`e2ad30b`）
   - `exec` 保护不再只限 `agent:*:main`，统一覆盖所有非 subagent 会话
   - 与“默认工具调用走子会话”的策略保持一致，减少长任务误占主会话风险

5. **文档与中文快速使用段落持续更新**（`c8d198f`, `d70212c`）
   - README 已按当前工作流状态补齐并简化中文 Quickstart
   - 保持仓库说明与实际 CI/CD 行为一致

---

## 默认补丁行为（非实验）

- 控制面 `/status`、`/stop` 严格匹配 + fast path
- 默认工具调用路由到子会话（除非显式强制主会话）
- 状态栏个性化标识（如 `PERSONAL BUILD`）
- 相关控制面可靠性修复

> 说明：实验性 ZMQ/exec-supervisor 补丁默认不参与 apply。

---

## 快速使用

### 普通模式（已安装 OpenClaw）

```bash
bin/openclaw-personal status
bin/openclaw-personal apply
bin/openclaw-personal rollback
```

指定 artifact（本地路径或 URL）：

```bash
bin/openclaw-personal apply --artifact <path-or-url>
# 或
bin/openclaw-personal apply <path-or-url>
```

### 源码模式（本地源码树）

```bash
bin/openclaw-personal status --source ~/openclaw-src
bin/openclaw-personal apply --source ~/openclaw-src
bin/openclaw-personal rollback --source ~/openclaw-src
```

---

## 自动化流程（现状）

### overlay-ci
- 校验兼容矩阵
- 应用补丁并执行基础构建/烟测
- 产出 `dist-overlay.tar.gz`
- 标签发布时上传 release 资产

### auto-compat
- 定时发现上游最新版本/提交
- 未覆盖时生成候选兼容条目与 patchset
- 候选可应用并通过检查时自动开 PR
- 候选不可应用时 warning + skip（不中断全流程）

### support-release-rollover
- 按最新兼容条目维护 `support/v<version>` 分支
- 维护 `overlay-v<version>` release
- release 强制附带最新 `compatibility.json`
- 仅保留最近 20 条 support 分支

---

## 兼容与安全

- 兼容键：`openclawVersion + commitSha`
- 任一不匹配：`apply` 非 0 退出
- 默认 fail-safe，不做破坏性写入

当前兼容详情以 `compatibility.json` 为准。

---

## 仓库结构

- `bin/openclaw-personal`：CLI 入口
- `compatibility.json`：兼容矩阵与策略
- `patches/`：补丁集（含 autocompat 目录）
- `scripts/`：apply/rollback/build/validate
- `.github/workflows/`：CI 与自动兼容/发布流程
- `CHANGELOG.md`：版本变更记录

Releases: <https://github.com/dddabtc/openclaw-personal-overlay/releases>
