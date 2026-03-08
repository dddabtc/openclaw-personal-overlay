# POSTMORTEM: dist/plugin-sdk 导出缺失导致 overlay 后 extension 全量报错

## 摘要

问题根因是：overlay 构建产物里的 `dist/plugin-sdk` 不完整，但发布流程把整个 `dist/` 覆盖到目标安装目录，导致官方需要的 plugin-sdk 子入口文件被替换/丢失。

## 影响

- overlay apply 后，依赖 `plugin-sdk/*` 子入口的 extension 在运行时报 `MODULE_NOT_FOUND` 或导入失败。
- 113 上表现为“所有 extension 插件报错”。

---

## 为什么现有 CI/流程没拦住

### 1) `scripts/validate-compatibility.py` 实际只校验兼容矩阵 JSON 格式

它只检查：
- `supported` 是否非空数组
- 字段存在性（`openclawVersion`, `commitSha`）
- commitSha 格式
- 版本+sha 去重

**没有任何 dist 文件级校验**，更不会校验 `package.json#exports` 对应文件是否存在。

### 2) `tests/openclaw-personal.test.sh` 是 apply/rollback 行为烟测，不是产物完整性测试

它主要覆盖：
- apply 成功与兼容性拦截
- checksum 拦截
- status 输出
- rollback 恢复

但测试工件是最小化 mock（一个 `banner.txt`），**不包含真实 `plugin-sdk` 导出集合**，因此不会触发“导出缺失”问题。

### 3) `scripts/build-dist-overlay.sh` 之前直接 rsync patched `dist/`

旧逻辑：
- `rsync -a "$WORK_DIR/dist/" "$OUT_DIR/payload/dist/"`

没有：
- baseline 合并（保留 upstream 完整 dist）
- 导出完整性校验

因此一旦 patched build 本身没产出完整 `plugin-sdk`，就会直接把不完整产物打进 release。

### 4) `release.yml` 只有“资产存在性”门禁，没有“资产正确性”门禁

旧 preflight 只检查：
- `dist-overlay.tar.gz` 存在
- `dist-overlay.tar.gz.sha256` 存在

**没有检查 payload 内容是否满足 upstream exports 契约**。

### 5) `auto-compat.yml` 的“兼容”判定基于版本推进 + 关键脚本通过

full-flow 只跑：
- `validate-compatibility.py`
- `openclaw-personal.test.sh`

所以“兼容”实际上是元数据/流程层面通过，不代表 dist 导出完整。

---

## 本次修复

### A. 新增 `scripts/validate-dist-exports.sh`

功能：
- 输入：`<payload-dir> <openclaw-version>`
- 优先下载 `openclaw@<version>` npm 包并读取其 `package.json#exports`
- 解析所有 `./plugin-sdk/*` 对应到 `./dist/plugin-sdk/*.js` 的导出目标（含通配符展开）
- 对照 overlay payload 的 `dist/plugin-sdk/...` 实际文件
- 缺失即 fail + exit 1，并打印缺失列表

### B. 修复 `scripts/build-dist-overlay.sh`

关键改动：
1. 先准备 baseline dist（优先传入 `BASELINE_DIR`，否则自动 `npm pack openclaw@TARGET_VERSION`）
2. 构建 payload 时先拷 baseline dist，再覆盖 patched dist：
   - `rsync baseline/dist -> payload/dist`
   - `rsync patched/dist -> payload/dist`
3. 打包前执行 `validate-dist-exports.sh` 作为构建内 gate

这避免了“patched build 不完整时把 upstream 必需文件全部冲掉”的问题。

### C. 集成到 CI / Release

- `ci.yml`：新增 `setup-node`，并新增一步：
  - 下载一个 compatibility 版本的官方 npm 包
  - 用 `validate-dist-exports.sh` 对官方 payload 自检（保证脚本本身可靠）
- `release.yml`：新增 preflight gate：
  - `bash scripts/validate-dist-exports.sh dist-overlay/payload $TARGET_VERSION`
  - 失败即中断发布

---

## 下次如何避免

1. **把“exports 契约”视为发布阻断项**（必须在 release preflight 里）
2. **overlay 构建默认 baseline + patch merge**，禁止“只用 patch dist 全量覆盖”
3. 对关键目录（`dist/plugin-sdk`）增加专门可观测指标（文件数、缺失数）
4. smoke test 增加真实/半真实导出样本，避免只测最小 mock
