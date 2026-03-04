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

## 近期关键更新（README 补齐）

1. **auto-compat 失败策略调整**（`81aee88`）
   - 候选 patchset 无法干净应用时，workflow 改为 warning + skip
   - 不再把整条自动兼容流程直接标红失败

2. **support release 资产治理修正**（`36a33df`, `a9d5678`）
   - 支持发布强制上传最新版 `compatibility.json`
   - 清理过时 `compatibility-candidate.json` 资产

3. **`/status` 控制面严格匹配修复回补**（`8e68ee6`）
   - 修复 strict match / fast-path guard 相关回归

4. **CLI 安装根目录解析更稳**（`4bdd3a7`）
   - 优先从 `which openclaw` 解析实际安装路径
   - 多安装时给出告警，可用 `OPENCLAW_INSTALL_ROOT` 覆盖

5. **项目治理文件补齐**（`c6aa1d1`）
   - 增加 `CHANGELOG.md`、Issue/PR 模板等

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