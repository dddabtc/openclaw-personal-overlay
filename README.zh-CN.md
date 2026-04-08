# openclaw-personal-overlay

**安全地给 OpenClaw 打个人补丁 — 版本锁定、一键应用/回滚、自动备份。**

[![CI](https://github.com/dddabtc/openclaw-personal-overlay/actions/workflows/ci.yml/badge.svg)](https://github.com/dddabtc/openclaw-personal-overlay/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/dddabtc/openclaw-personal-overlay)](https://github.com/dddabtc/openclaw-personal-overlay/releases)

> English docs: **[README.md](./README.md)**
>
> OpenClaw 上游仓库：**[github.com/openclaw/openclaw](https://github.com/openclaw/openclaw)** · 文档：**[docs.openclaw.ai](https://docs.openclaw.ai)**

## 为什么需要这个

OpenClaw 不是所有行为都能配置。这个 overlay 让你把个人补丁维护在上游仓库之外，只在版本精确匹配时才应用 — 上游更新不会悄悄搞坏你的定制。

## 它做什么

- **版本锁定** — 只在 `openclawVersion + commitSha` 完全匹配时才打补丁，不匹配直接拒绝。
- **一条命令搞定** — `status`、`apply`、`rollback`，没了。
- **安全应用** — 先暂存、再覆盖、自动备份、校验 checksum。
- **两种模式** — 源码补丁（`git am`）或预构建二进制制品。
- **自动兼容 CI** — 自动检测上游新版本，验证补丁兼容性。

## 当前补丁内容

主要解决稳定性和响应性问题：

| 补丁 | 作用 |
|------|------|
| **Exec 拦截** | 拦截主会话中有风险的长时间前台执行 |
| **SSH 拦截** | 主会话中硬拦截 SSH 类命令 |
| **输出上限** | 限制主会话输出字节数，防止输出失控 |
| **控制面快路径** | `/stop` 和 `/status` 走独立控制通道，不会被卡住的会话阻塞 |
| **可中断重试** | 瞬时错误的重试等待可以被打断 |
| **子代理超时** | 将子代理（subagent）默认超时时间延长到 6 小时（上游默认值对复杂任务来说太短） |

## 快速开始

```bash
# 检查兼容性
bin/openclaw-personal status

# 应用补丁
bin/openclaw-personal apply

# 回滚
bin/openclaw-personal rollback
```

### 源码模式

```bash
bin/openclaw-personal apply --source ~/openclaw-src
```

### 指定制品

```bash
bin/openclaw-personal apply --artifact <path-or-url>
```

## 仓库结构

```
bin/openclaw-personal       — CLI 入口
compatibility.json          — 版本兼容矩阵与 overlay 策略
patches/                    — 版本化补丁队列
scripts/                    — 应用/回滚/构建/校验脚本
dist-overlay-local/         — 预构建二进制 overlay
.github/workflows/          — CI、自动兼容、发布自动化
docs/                       — 实现细节
```

## 下载

预构建 overlay：<https://github.com/dddabtc/openclaw-personal-overlay/releases>
