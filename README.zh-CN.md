# openclaw-personal-overlay

这是叠加在 OpenClaw 上的个人 Overlay：用严格门禁管理补丁应用，并提供可回滚流程。

**TL;DR**
- 把个人行为补丁放在上游仓库之外。
- 只在 `openclawVersion + commitSha` 匹配时允许应用。
- 统一入口：`status / apply / rollback`。
- 普通安装模式有分阶段拷贝、备份和校验保护。
- 降低流程卡死风险：`/stop`、`/status` 走独立控制通道。

[![CI](https://github.com/dddabtc/openclaw-personal-overlay/actions/workflows/ci.yml/badge.svg)](https://github.com/dddabtc/openclaw-personal-overlay/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/dddabtc/openclaw-personal-overlay)](https://github.com/dddabtc/openclaw-personal-overlay/releases)

> 英文文档：**[README.md](./README.md)**

## Overlay 已实现的具体能力（均可在仓库中定位）

1. **严格兼容门禁**  
   以 `openclawVersion + commitSha` 作为匹配键；不匹配直接非 0 退出（fail-safe）。  
   证据：`bin/openclaw-personal`、`compatibility.json`、`scripts/validate-compatibility.py`

2. **双交付模式：源码补丁 / 二进制制品**  
   - 源码模式：按 `patchSetDir` 执行 `git am`  
   - 制品模式：读取 release artifact，并校验 metadata/checksum  
   证据：`scripts/apply-personal-patch.sh`、`scripts/rollback-personal-patch.sh`、`scripts/build-dist-overlay.sh`、`dist-overlay/metadata.json`

3. **普通用户安装路径的安全措施**  
   - 自动识别安装目录
   - 先 staging 再覆盖
   - 覆盖前备份 payload 文件
   - rollback 前先做备份完整性校验
   证据：`bin/openclaw-personal`（`regular_apply`、`regular_rollback`）

4. **自动兼容追踪与发布自动化**  
   - 自动检测上游版本并比较兼容矩阵
   - full-flow 校验门禁
   - 发布资产上传后再次 API 校验
   证据：`.github/workflows/auto-compat.yml`、`.github/workflows/release.yml`、`.github/workflows/ci.yml`

5. **主会话 exec 风险约束（防卡住）**  
   Overlay 补丁为主会话增加长任务拦截策略：限制前台长 exec，要求更安全的执行方式。  
   证据：`patches/e7b600e31882-autocompat/0001-feat-exec-guard-long-exec-in-main-sessions-via-polic.patch`

6. **`/stop` 与 `/status` 的控制面快路径（防阻塞）**  
   Overlay 补丁把这两个命令引导到耐久化控制面，带严格匹配、超时处理和恢复标记。  
   证据：`patches/e7b600e31882-autocompat/0008-feat-control-plane-route-stop-and-status-via-durable.patch`、`0005-telegram-fast-path-stop-and-status-in-ingress-contro.patch`、`0009-fix-control-plane-align-control-lane-status-timeout-.patch`

## 原版 OpenClaw 未覆盖 vs 本 Overlay 提供什么

### 本 Overlay 额外提供
- 兼容矩阵 + 硬门禁（`compatibility.json` + wrapper/scripts）。
- 可版本化的个人 patchset，配套可重复 apply/rollback。
- `/stop`、`/status` 的控制面/命令通道补丁链。
- 主会话 exec 安全补丁（长 exec 拦截、SSH 家族命令拦截、输出上限）。

### 当前未覆盖（明确说明）
- **未提供**“一键按组选择实验补丁”的 wrapper 参数（如 ZMQ 实验层）；目前是手动选择路径。  
  证据：`docs/IMPLEMENTATION.md`（Current limitation / TODO）、`compatibility.json`（`optionalExperimentalPatchDirs`）
- **未提供**独立守护服务来自动清理所有卡死子进程；当前机制是“策略约束 + 控制面快速通道”。

## 关于“防止 exec 假死/流程卡死”的现状

已实现（在补丁集中）：
- 主会话长 exec 拦截：`0001...patch`
- 主会话 SSH 家族命令硬拦截：`0014-fix-exec-hard-block-ssh-and-long-exec-in-main-sessio.patch`
- 主会话输出上限：`0017-feat-exec-add-session-max-output-bytes-policy.patch`
- 瞬时错误重试等待可被中断：`0006-fix-make-transient-retry-delay-abortable.patch`
- `/stop`、`/status` 耐久化控制面：`0008...`、`0009...`、`0015...`、`0016...`

默认未启用：
- ZMQ exec-supervisor 路径是可选实验层，默认排除。  
  证据：`docs/IMPLEMENTATION.md`、`compatibility.json`

## 快速使用

### 已安装 OpenClaw

```bash
bin/openclaw-personal status
bin/openclaw-personal apply
bin/openclaw-personal rollback
```

指定 artifact：

```bash
bin/openclaw-personal apply --artifact <path-or-url>
```

### 源码模式

```bash
bin/openclaw-personal status --source ~/openclaw-src
bin/openclaw-personal apply --source ~/openclaw-src
bin/openclaw-personal rollback --source ~/openclaw-src
```

## 仓库结构

- `bin/openclaw-personal` — status/apply/rollback 入口
- `compatibility.json` — 兼容矩阵与 overlay 策略
- `patches/` — 版本化补丁队列（含 autocompat）
- `scripts/` — apply/rollback/build/校验脚本
- `.github/workflows/` — CI、auto-compat、release、autofix
- `docs/` — 实现与使用说明

Releases: <https://github.com/dddabtc/openclaw-personal-overlay/releases>
