# openclaw-personal-overlay

[![overlay-ci](https://github.com/dddabtc/openclaw-personal-overlay/actions/workflows/overlay-ci.yml/badge.svg)](https://github.com/dddabtc/openclaw-personal-overlay/actions/workflows/overlay-ci.yml)
[![Release](https://img.shields.io/github/v/release/dddabtc/openclaw-personal-overlay)](https://github.com/dddabtc/openclaw-personal-overlay/releases)

OpenClaw 个人 Overlay 补丁层。

> English docs: **[README.md](./README.md)**

## 仓库作用

在尽量不维护长期私有 fork 的前提下，持续跟进上游 OpenClaw，并保留个人行为补丁。

- 跟进上游更新
- 安全应用个人补丁
- 支持快速回滚

## 核心能力

- 基于 `openclawVersion + commitSha` 的兼容门禁
- `status / apply / rollback` 一键流程
- 版本不匹配时 fail-safe 退出（避免误写）

## 快速使用

### 已安装 OpenClaw

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

### 源码模式

```bash
bin/openclaw-personal status --source ~/openclaw-src
bin/openclaw-personal apply --source ~/openclaw-src
bin/openclaw-personal rollback --source ~/openclaw-src
```

## 自动化流程

- **overlay-ci**：校验兼容矩阵、应用补丁、执行基础检查、产出 `dist-overlay.tar.gz`
- **auto-compat**：发现上游新版本，生成候选 patchset，检查通过后自动开 PR
- **support-release-rollover**：维护 support 分支/发布，并上传最新 `compatibility.json`

## 安全模型

- 兼容键：`openclawVersion + commitSha`
- 任一不匹配：`apply` 非 0 退出
- 默认策略：fail-safe

当前兼容详情请看 `compatibility.json`。

## 仓库结构

- `bin/openclaw-personal`：CLI 入口
- `compatibility.json`：兼容矩阵与策略
- `patches/`：补丁集（含 autocompat）
- `scripts/`：apply/rollback/build/validate 脚本
- `.github/workflows/`：CI 与发布自动化
- `CHANGELOG.md`：版本变更记录

Releases: <https://github.com/dddabtc/openclaw-personal-overlay/releases>
