import { Dt as theme, U as CONFIG_DIR, _ as defaultRuntime, lt as shortenHomePath, ot as resolveUserPath } from "./entry.js";
import "./auth-profiles-C7RTY9Sv.js";
import { t as formatCliCommand } from "./command-format-D3syQOZg.js";
import "./exec-CBKBIMpA.js";
import { c as resolveAgentWorkspaceDir, l as resolveDefaultAgentId } from "./agent-scope-DhajVyRS.js";
import "./github-copilot-token-DuFIqfeC.js";
import "./model-ChKLb_d2.js";
import "./pi-model-discovery-Do3xMEtM.js";
import "./frontmatter-D-YR-Ghi.js";
import { a as MANIFEST_KEY, n as isPathInside, r as isPathInsideWithRealpath } from "./scan-paths-B22E7-Cg.js";
import "./skills-Bq1s47OA.js";
import "./manifest-registry-XSxPcu0S.js";
import { i as loadConfig, l as writeConfigFile } from "./config-DMW11Vgn.js";
import "./client-DrK7aLru.js";
import "./call-DpGX4uMX.js";
import "./message-channel-CVHJDItx.js";
import "./pairing-token-Byh6drgn.js";
import "./subagent-registry-BDJet-Vq.js";
import "./sessions-CsRDsl2f.js";
import "./tokens-ANnYrShl.js";
import "./plugins-Dhh2a3qc.js";
import "./accounts-BrsscXpo.js";
import "./bindings-BO7DQ_-I.js";
import "./logging-CFvkxgcX.js";
import "./send-Big2UFm_.js";
import "./send-hNGYd45P.js";
import "./with-timeout-iOq9EFfz.js";
import "./deliver-CyeIWbI8.js";
import "./diagnostic-C6WTf4ZE.js";
import "./diagnostic-session-state-CIjIGxEE.js";
import "./accounts-1gFWxwAw.js";
import "./send-Ca4_6d3W.js";
import "./image-ops-CKJNUuNW.js";
import "./pi-embedded-helpers-Cf-sQwMv.js";
import "./sandbox-DpWD18_K.js";
import "./chrome-DkGieswr.js";
import { l as promptYesNo } from "./tailscale-BxzsxqAY.js";
import "./auth-BcWLEKcS.js";
import "./server-context-CX9PSgDC.js";
import "./routes-DeZNDmn_.js";
import "./redact-B40lik2B.js";
import "./errors-Ba_ROWsq.js";
import "./fs-safe-CERgjtot.js";
import "./paths-Dzc_6Z5O.js";
import "./ssrf-Ixuyn7h8.js";
import "./store-DRvx-vgM.js";
import "./ports-CjVslX4J.js";
import "./trash-CWQQXWX3.js";
import "./dock-BkVflx2Q.js";
import "./accounts-CuhuCyTF.js";
import "./paths-DNdWAq7b.js";
import "./tool-images-CW04CAn5.js";
import "./thinking-8sKPnzpp.js";
import "./models-config-xdiIJ--F.js";
import "./reply-prefix-D4RfrCeP.js";
import "./memory-cli-meSZHVr2.js";
import "./manager-CYx1MWZA.js";
import "./gemini-auth-FuBGrv0B.js";
import "./sqlite-CQGamAhm.js";
import "./retry-C4Q_VPOo.js";
import "./target-errors-C6mkRlU9.js";
import "./chunk-D6AoZjLE.js";
import "./markdown-tables-CVgUytSx.js";
import "./fetch-guard-Dp7VnmeK.js";
import "./local-roots-LE1f_G0M.js";
import "./ir-DwFJAkDs.js";
import "./render-e7fENCYH.js";
import "./commands-j9S9qRB6.js";
import "./commands-registry-BDRoefkH.js";
import "./image-CMLQrCWd.js";
import "./tool-display-DixohEVL.js";
import "./session-utils-DwO3Isif.js";
import "./session-cost-usage-Dfx7NHjv.js";
import "./runner-BqlaWRyu.js";
import "./model-catalog-DPgNYd7O.js";
import "./skill-commands-DR5wCsHu.js";
import "./workspace-dirs-Dw0EowUJ.js";
import "./pairing-store-BqeL7tj7.js";
import "./fetch-DOex5qYK.js";
import "./exec-approvals-BKZqQjp9.js";
import "./nodes-screen-DCJNznUw.js";
import "./channel-activity-myOnmDZi.js";
import "./tables-CKA-N6SU.js";
import "./control-service-jtQ1tZZN.js";
import "./stagger-CQar2eKe.js";
import "./channel-selection-D5cjTEHf.js";
import "./send-7EWRElEf.js";
import "./outbound-attachment-Bc9bVXwP.js";
import "./delivery-queue-CzNZXd1M.js";
import "./send-ChEZW6oS.js";
import "./resolve-route-C4DUT14V.js";
import "./proxy-DL3MD6-P.js";
import { t as formatDocsLink } from "./links-CW8Bx7rK.js";
import "./cli-utils-CCaEbxAz.js";
import "./help-format-B0pWGnZs.js";
import "./progress-BAHiAaDW.js";
import "./replies-BjWvOhNO.js";
import "./onboard-helpers-BE4hqP_a.js";
import "./prompt-style-DwCXob2h.js";
import "./pairing-labels-D4ymYAjE.js";
import "./pi-tools.policy-PdQU4Q59.js";
import { a as extractArchive, c as resolveArchiveKind, i as unscopedPackageName, l as resolvePackedRootDir, o as fileExists, s as readJsonFile, t as resolveSafeInstallDir } from "./install-safe-path-BK8js28D.js";
import { a as installPackageDir, i as withTempDir, n as installFromNpmSpecArchive, r as resolveArchiveSourcePath, t as validateRegistryNpmSpec } from "./npm-registry-spec-DkaZNHAW.js";
import { t as renderTable } from "./table-C9BoE_4p.js";
import { a as parseFrontmatter, t as loadWorkspaceHookEntries } from "./workspace-DWI9N-Ks.js";
import { t as buildWorkspaceHookStatus } from "./hooks-status-CNo1bkDq.js";
import { t as buildPluginStatusReport } from "./status-BWbExs7A.js";
import path from "node:path";
import fs from "node:fs";
import fs$1 from "node:fs/promises";

//#region src/hooks/install.ts
const defaultLogger = {};
function validateHookId(hookId) {
	if (!hookId) return "invalid hook name: missing";
	if (hookId === "." || hookId === "..") return "invalid hook name: reserved path segment";
	if (hookId.includes("/") || hookId.includes("\\")) return "invalid hook name: path separators not allowed";
	return null;
}
function resolveHookInstallDir(hookId, hooksDir) {
	const hooksBase = hooksDir ? resolveUserPath(hooksDir) : path.join(CONFIG_DIR, "hooks");
	const hookIdError = validateHookId(hookId);
	if (hookIdError) throw new Error(hookIdError);
	const targetDirResult = resolveSafeInstallDir({
		baseDir: hooksBase,
		id: hookId,
		invalidNameMessage: "invalid hook name: path traversal detected"
	});
	if (!targetDirResult.ok) throw new Error(targetDirResult.error);
	return targetDirResult.path;
}
async function ensureOpenClawHooks(manifest) {
	const hooks = manifest[MANIFEST_KEY]?.hooks;
	if (!Array.isArray(hooks)) throw new Error("package.json missing openclaw.hooks");
	const list = hooks.map((e) => typeof e === "string" ? e.trim() : "").filter(Boolean);
	if (list.length === 0) throw new Error("package.json openclaw.hooks is empty");
	return list;
}
function resolveHookInstallModeOptions(params) {
	return {
		logger: params.logger ?? defaultLogger,
		mode: params.mode ?? "install",
		dryRun: params.dryRun ?? false
	};
}
function resolveTimedHookInstallModeOptions(params) {
	return {
		...resolveHookInstallModeOptions(params),
		timeoutMs: params.timeoutMs ?? 12e4
	};
}
async function resolveInstallTargetDir(id, hooksDir) {
	const baseHooksDir = hooksDir ? resolveUserPath(hooksDir) : path.join(CONFIG_DIR, "hooks");
	await fs$1.mkdir(baseHooksDir, { recursive: true });
	const targetDirResult = resolveSafeInstallDir({
		baseDir: baseHooksDir,
		id,
		invalidNameMessage: "invalid hook name: path traversal detected"
	});
	if (!targetDirResult.ok) return {
		ok: false,
		error: targetDirResult.error
	};
	return {
		ok: true,
		targetDir: targetDirResult.path
	};
}
async function resolveHookNameFromDir(hookDir) {
	const hookMdPath = path.join(hookDir, "HOOK.md");
	if (!await fileExists(hookMdPath)) throw new Error(`HOOK.md missing in ${hookDir}`);
	return parseFrontmatter(await fs$1.readFile(hookMdPath, "utf-8")).name || path.basename(hookDir);
}
async function validateHookDir(hookDir) {
	if (!await fileExists(path.join(hookDir, "HOOK.md"))) throw new Error(`HOOK.md missing in ${hookDir}`);
	if (!await Promise.all([
		"handler.ts",
		"handler.js",
		"index.ts",
		"index.js"
	].map(async (candidate) => fileExists(path.join(hookDir, candidate)))).then((results) => results.some(Boolean))) throw new Error(`handler.ts/handler.js/index.ts/index.js missing in ${hookDir}`);
}
async function installHookPackageFromDir(params) {
	const { logger, timeoutMs, mode, dryRun } = resolveTimedHookInstallModeOptions(params);
	const manifestPath = path.join(params.packageDir, "package.json");
	if (!await fileExists(manifestPath)) return {
		ok: false,
		error: "package.json missing"
	};
	let manifest;
	try {
		manifest = await readJsonFile(manifestPath);
	} catch (err) {
		return {
			ok: false,
			error: `invalid package.json: ${String(err)}`
		};
	}
	let hookEntries;
	try {
		hookEntries = await ensureOpenClawHooks(manifest);
	} catch (err) {
		return {
			ok: false,
			error: String(err)
		};
	}
	const pkgName = typeof manifest.name === "string" ? manifest.name : "";
	const hookPackId = pkgName ? unscopedPackageName(pkgName) : path.basename(params.packageDir);
	const hookIdError = validateHookId(hookPackId);
	if (hookIdError) return {
		ok: false,
		error: hookIdError
	};
	if (params.expectedHookPackId && params.expectedHookPackId !== hookPackId) return {
		ok: false,
		error: `hook pack id mismatch: expected ${params.expectedHookPackId}, got ${hookPackId}`
	};
	const targetDirResult = await resolveInstallTargetDir(hookPackId, params.hooksDir);
	if (!targetDirResult.ok) return {
		ok: false,
		error: targetDirResult.error
	};
	const targetDir = targetDirResult.targetDir;
	if (mode === "install" && await fileExists(targetDir)) return {
		ok: false,
		error: `hook pack already exists: ${targetDir} (delete it first)`
	};
	const resolvedHooks = [];
	for (const entry of hookEntries) {
		const hookDir = path.resolve(params.packageDir, entry);
		if (!isPathInside(params.packageDir, hookDir)) return {
			ok: false,
			error: `openclaw.hooks entry escapes package directory: ${entry}`
		};
		await validateHookDir(hookDir);
		if (!isPathInsideWithRealpath(params.packageDir, hookDir, { requireRealpath: true })) return {
			ok: false,
			error: `openclaw.hooks entry resolves outside package directory: ${entry}`
		};
		const hookName = await resolveHookNameFromDir(hookDir);
		resolvedHooks.push(hookName);
	}
	if (dryRun) return {
		ok: true,
		hookPackId,
		hooks: resolvedHooks,
		targetDir,
		version: typeof manifest.version === "string" ? manifest.version : void 0
	};
	const deps = manifest.dependencies ?? {};
	const hasDeps = Object.keys(deps).length > 0;
	const installRes = await installPackageDir({
		sourceDir: params.packageDir,
		targetDir,
		mode,
		timeoutMs,
		logger,
		copyErrorPrefix: "failed to copy hook pack",
		hasDeps,
		depsLogMessage: "Installing hook pack dependencies…"
	});
	if (!installRes.ok) return installRes;
	return {
		ok: true,
		hookPackId,
		hooks: resolvedHooks,
		targetDir,
		version: typeof manifest.version === "string" ? manifest.version : void 0
	};
}
async function installHookFromDir(params) {
	const { logger, mode, dryRun } = resolveHookInstallModeOptions(params);
	await validateHookDir(params.hookDir);
	const hookName = await resolveHookNameFromDir(params.hookDir);
	const hookIdError = validateHookId(hookName);
	if (hookIdError) return {
		ok: false,
		error: hookIdError
	};
	if (params.expectedHookPackId && params.expectedHookPackId !== hookName) return {
		ok: false,
		error: `hook id mismatch: expected ${params.expectedHookPackId}, got ${hookName}`
	};
	const targetDirResult = await resolveInstallTargetDir(hookName, params.hooksDir);
	if (!targetDirResult.ok) return {
		ok: false,
		error: targetDirResult.error
	};
	const targetDir = targetDirResult.targetDir;
	if (mode === "install" && await fileExists(targetDir)) return {
		ok: false,
		error: `hook already exists: ${targetDir} (delete it first)`
	};
	if (dryRun) return {
		ok: true,
		hookPackId: hookName,
		hooks: [hookName],
		targetDir
	};
	logger.info?.(`Installing to ${targetDir}…`);
	let backupDir = null;
	if (mode === "update" && await fileExists(targetDir)) {
		backupDir = `${targetDir}.backup-${Date.now()}`;
		await fs$1.rename(targetDir, backupDir);
	}
	try {
		await fs$1.cp(params.hookDir, targetDir, { recursive: true });
	} catch (err) {
		if (backupDir) {
			await fs$1.rm(targetDir, {
				recursive: true,
				force: true
			}).catch(() => void 0);
			await fs$1.rename(backupDir, targetDir).catch(() => void 0);
		}
		return {
			ok: false,
			error: `failed to copy hook: ${String(err)}`
		};
	}
	if (backupDir) await fs$1.rm(backupDir, {
		recursive: true,
		force: true
	}).catch(() => void 0);
	return {
		ok: true,
		hookPackId: hookName,
		hooks: [hookName],
		targetDir
	};
}
async function installHooksFromArchive(params) {
	const logger = params.logger ?? defaultLogger;
	const timeoutMs = params.timeoutMs ?? 12e4;
	const archivePathResult = await resolveArchiveSourcePath(params.archivePath);
	if (!archivePathResult.ok) return archivePathResult;
	const archivePath = archivePathResult.path;
	return await withTempDir("openclaw-hook-", async (tmpDir) => {
		const extractDir = path.join(tmpDir, "extract");
		await fs$1.mkdir(extractDir, { recursive: true });
		logger.info?.(`Extracting ${archivePath}…`);
		try {
			await extractArchive({
				archivePath,
				destDir: extractDir,
				timeoutMs,
				logger
			});
		} catch (err) {
			return {
				ok: false,
				error: `failed to extract archive: ${String(err)}`
			};
		}
		let rootDir = "";
		try {
			rootDir = await resolvePackedRootDir(extractDir);
		} catch (err) {
			return {
				ok: false,
				error: String(err)
			};
		}
		if (await fileExists(path.join(rootDir, "package.json"))) return await installHookPackageFromDir({
			packageDir: rootDir,
			hooksDir: params.hooksDir,
			timeoutMs,
			logger,
			mode: params.mode,
			dryRun: params.dryRun,
			expectedHookPackId: params.expectedHookPackId
		});
		return await installHookFromDir({
			hookDir: rootDir,
			hooksDir: params.hooksDir,
			logger,
			mode: params.mode,
			dryRun: params.dryRun,
			expectedHookPackId: params.expectedHookPackId
		});
	});
}
async function installHooksFromNpmSpec(params) {
	const { logger, timeoutMs, mode, dryRun } = resolveTimedHookInstallModeOptions(params);
	const expectedHookPackId = params.expectedHookPackId;
	const spec = params.spec.trim();
	const specError = validateRegistryNpmSpec(spec);
	if (specError) return {
		ok: false,
		error: specError
	};
	logger.info?.(`Downloading ${spec}…`);
	const flowResult = await installFromNpmSpecArchive({
		tempDirPrefix: "openclaw-hook-pack-",
		spec,
		timeoutMs,
		expectedIntegrity: params.expectedIntegrity,
		onIntegrityDrift: params.onIntegrityDrift,
		warn: (message) => {
			logger.warn?.(message);
		},
		installFromArchive: async ({ archivePath }) => await installHooksFromArchive({
			archivePath,
			hooksDir: params.hooksDir,
			timeoutMs,
			logger,
			mode,
			dryRun,
			expectedHookPackId
		})
	});
	if (!flowResult.ok) return flowResult;
	if (!flowResult.installResult.ok) return flowResult.installResult;
	return {
		...flowResult.installResult,
		npmResolution: flowResult.npmResolution,
		integrityDrift: flowResult.integrityDrift
	};
}
async function installHooksFromPath(params) {
	const resolved = resolveUserPath(params.path);
	if (!await fileExists(resolved)) return {
		ok: false,
		error: `path not found: ${resolved}`
	};
	if ((await fs$1.stat(resolved)).isDirectory()) {
		if (await fileExists(path.join(resolved, "package.json"))) return await installHookPackageFromDir({
			packageDir: resolved,
			hooksDir: params.hooksDir,
			timeoutMs: params.timeoutMs,
			logger: params.logger,
			mode: params.mode,
			dryRun: params.dryRun,
			expectedHookPackId: params.expectedHookPackId
		});
		return await installHookFromDir({
			hookDir: resolved,
			hooksDir: params.hooksDir,
			logger: params.logger,
			mode: params.mode,
			dryRun: params.dryRun,
			expectedHookPackId: params.expectedHookPackId
		});
	}
	if (!resolveArchiveKind(resolved)) return {
		ok: false,
		error: `unsupported hook file: ${resolved}`
	};
	return await installHooksFromArchive({
		archivePath: resolved,
		hooksDir: params.hooksDir,
		timeoutMs: params.timeoutMs,
		logger: params.logger,
		mode: params.mode,
		dryRun: params.dryRun,
		expectedHookPackId: params.expectedHookPackId
	});
}

//#endregion
//#region src/hooks/installs.ts
function recordHookInstall(cfg, update) {
	const { hookId, ...record } = update;
	const installs = {
		...cfg.hooks?.internal?.installs,
		[hookId]: {
			...cfg.hooks?.internal?.installs?.[hookId],
			...record,
			installedAt: record.installedAt ?? (/* @__PURE__ */ new Date()).toISOString()
		}
	};
	return {
		...cfg,
		hooks: {
			...cfg.hooks,
			internal: {
				...cfg.hooks?.internal,
				installs: {
					...installs,
					[hookId]: installs[hookId]
				}
			}
		}
	};
}

//#endregion
//#region src/cli/hooks-cli.ts
function mergeHookEntries(pluginEntries, workspaceEntries) {
	const merged = /* @__PURE__ */ new Map();
	for (const entry of pluginEntries) merged.set(entry.hook.name, entry);
	for (const entry of workspaceEntries) merged.set(entry.hook.name, entry);
	return Array.from(merged.values());
}
function buildHooksReport(config) {
	const workspaceDir = resolveAgentWorkspaceDir(config, resolveDefaultAgentId(config));
	const workspaceEntries = loadWorkspaceHookEntries(workspaceDir, { config });
	return buildWorkspaceHookStatus(workspaceDir, {
		config,
		entries: mergeHookEntries(buildPluginStatusReport({
			config,
			workspaceDir
		}).hooks.map((hook) => hook.entry), workspaceEntries)
	});
}
function resolveHookForToggle(report, hookName, opts) {
	const hook = report.hooks.find((h) => h.name === hookName);
	if (!hook) throw new Error(`Hook "${hookName}" not found`);
	if (hook.managedByPlugin) throw new Error(`Hook "${hookName}" is managed by plugin "${hook.pluginId ?? "unknown"}" and cannot be enabled/disabled.`);
	if (opts?.requireEligible && !hook.eligible) throw new Error(`Hook "${hookName}" is not eligible (missing requirements)`);
	return hook;
}
function buildConfigWithHookEnabled(params) {
	const entries = { ...params.config.hooks?.internal?.entries };
	entries[params.hookName] = {
		...entries[params.hookName],
		enabled: params.enabled
	};
	const internal = {
		...params.config.hooks?.internal,
		...params.ensureHooksEnabled ? { enabled: true } : {},
		entries
	};
	return {
		...params.config,
		hooks: {
			...params.config.hooks,
			internal
		}
	};
}
function formatHookStatus(hook) {
	if (hook.eligible) return theme.success("✓ ready");
	if (hook.disabled) return theme.warn("⏸ disabled");
	return theme.error("✗ missing");
}
function formatHookName(hook) {
	return `${hook.emoji ?? "🔗"} ${theme.command(hook.name)}`;
}
function formatHookSource(hook) {
	if (!hook.managedByPlugin) return hook.source;
	return `plugin:${hook.pluginId ?? "unknown"}`;
}
function formatHookMissingSummary(hook) {
	const missing = [];
	if (hook.missing.bins.length > 0) missing.push(`bins: ${hook.missing.bins.join(", ")}`);
	if (hook.missing.anyBins.length > 0) missing.push(`anyBins: ${hook.missing.anyBins.join(", ")}`);
	if (hook.missing.env.length > 0) missing.push(`env: ${hook.missing.env.join(", ")}`);
	if (hook.missing.config.length > 0) missing.push(`config: ${hook.missing.config.join(", ")}`);
	if (hook.missing.os.length > 0) missing.push(`os: ${hook.missing.os.join(", ")}`);
	return missing.join("; ");
}
function exitHooksCliWithError(err) {
	defaultRuntime.error(`${theme.error("Error:")} ${err instanceof Error ? err.message : String(err)}`);
	process.exit(1);
}
async function runHooksCliAction(action) {
	try {
		await action();
	} catch (err) {
		exitHooksCliWithError(err);
	}
}
function createInstallLogger() {
	return {
		info: (msg) => defaultRuntime.log(msg),
		warn: (msg) => defaultRuntime.log(theme.warn(msg))
	};
}
function logGatewayRestartHint() {
	defaultRuntime.log("Restart the gateway to load hooks.");
}
async function readInstalledPackageVersion(dir) {
	try {
		const raw = await fs$1.readFile(path.join(dir, "package.json"), "utf-8");
		const parsed = JSON.parse(raw);
		return typeof parsed.version === "string" ? parsed.version : void 0;
	} catch {
		return;
	}
}
function enableInternalHookEntries(config, hookNames) {
	const entries = { ...config.hooks?.internal?.entries };
	for (const hookName of hookNames) entries[hookName] = {
		...entries[hookName],
		enabled: true
	};
	return {
		...config,
		hooks: {
			...config.hooks,
			internal: {
				...config.hooks?.internal,
				enabled: true,
				entries
			}
		}
	};
}
/**
* Format the hooks list output
*/
function formatHooksList(report, opts) {
	const hooks = opts.eligible ? report.hooks.filter((h) => h.eligible) : report.hooks;
	if (opts.json) {
		const jsonReport = {
			workspaceDir: report.workspaceDir,
			managedHooksDir: report.managedHooksDir,
			hooks: hooks.map((h) => ({
				name: h.name,
				description: h.description,
				emoji: h.emoji,
				eligible: h.eligible,
				disabled: h.disabled,
				source: h.source,
				pluginId: h.pluginId,
				events: h.events,
				homepage: h.homepage,
				missing: h.missing,
				managedByPlugin: h.managedByPlugin
			}))
		};
		return JSON.stringify(jsonReport, null, 2);
	}
	if (hooks.length === 0) return opts.eligible ? `No eligible hooks found. Run \`${formatCliCommand("openclaw hooks list")}\` to see all hooks.` : "No hooks found.";
	const eligible = hooks.filter((h) => h.eligible);
	const tableWidth = Math.max(60, (process.stdout.columns ?? 120) - 1);
	const rows = hooks.map((hook) => {
		const missing = formatHookMissingSummary(hook);
		return {
			Status: formatHookStatus(hook),
			Hook: formatHookName(hook),
			Description: theme.muted(hook.description),
			Source: formatHookSource(hook),
			Missing: missing ? theme.warn(missing) : ""
		};
	});
	const columns = [
		{
			key: "Status",
			header: "Status",
			minWidth: 10
		},
		{
			key: "Hook",
			header: "Hook",
			minWidth: 18,
			flex: true
		},
		{
			key: "Description",
			header: "Description",
			minWidth: 24,
			flex: true
		},
		{
			key: "Source",
			header: "Source",
			minWidth: 12,
			flex: true
		}
	];
	if (opts.verbose) columns.push({
		key: "Missing",
		header: "Missing",
		minWidth: 18,
		flex: true
	});
	const lines = [];
	lines.push(`${theme.heading("Hooks")} ${theme.muted(`(${eligible.length}/${hooks.length} ready)`)}`);
	lines.push(renderTable({
		width: tableWidth,
		columns,
		rows
	}).trimEnd());
	return lines.join("\n");
}
/**
* Format detailed info for a single hook
*/
function formatHookInfo(report, hookName, opts) {
	const hook = report.hooks.find((h) => h.name === hookName || h.hookKey === hookName);
	if (!hook) {
		if (opts.json) return JSON.stringify({
			error: "not found",
			hook: hookName
		}, null, 2);
		return `Hook "${hookName}" not found. Run \`${formatCliCommand("openclaw hooks list")}\` to see available hooks.`;
	}
	if (opts.json) return JSON.stringify(hook, null, 2);
	const lines = [];
	const emoji = hook.emoji ?? "🔗";
	const status = hook.eligible ? theme.success("✓ Ready") : hook.disabled ? theme.warn("⏸ Disabled") : theme.error("✗ Missing requirements");
	lines.push(`${emoji} ${theme.heading(hook.name)} ${status}`);
	lines.push("");
	lines.push(hook.description);
	lines.push("");
	lines.push(theme.heading("Details:"));
	if (hook.managedByPlugin) lines.push(`${theme.muted("  Source:")} ${hook.source} (${hook.pluginId ?? "unknown"})`);
	else lines.push(`${theme.muted("  Source:")} ${hook.source}`);
	lines.push(`${theme.muted("  Path:")} ${shortenHomePath(hook.filePath)}`);
	lines.push(`${theme.muted("  Handler:")} ${shortenHomePath(hook.handlerPath)}`);
	if (hook.homepage) lines.push(`${theme.muted("  Homepage:")} ${hook.homepage}`);
	if (hook.events.length > 0) lines.push(`${theme.muted("  Events:")} ${hook.events.join(", ")}`);
	if (hook.managedByPlugin) lines.push(theme.muted("  Managed by plugin; enable/disable via hooks CLI not available."));
	if (hook.requirements.bins.length > 0 || hook.requirements.anyBins.length > 0 || hook.requirements.env.length > 0 || hook.requirements.config.length > 0 || hook.requirements.os.length > 0) {
		lines.push("");
		lines.push(theme.heading("Requirements:"));
		if (hook.requirements.bins.length > 0) {
			const binsStatus = hook.requirements.bins.map((bin) => {
				return hook.missing.bins.includes(bin) ? theme.error(`✗ ${bin}`) : theme.success(`✓ ${bin}`);
			});
			lines.push(`${theme.muted("  Binaries:")} ${binsStatus.join(", ")}`);
		}
		if (hook.requirements.anyBins.length > 0) {
			const anyBinsStatus = hook.missing.anyBins.length > 0 ? theme.error(`✗ (any of: ${hook.requirements.anyBins.join(", ")})`) : theme.success(`✓ (any of: ${hook.requirements.anyBins.join(", ")})`);
			lines.push(`${theme.muted("  Any binary:")} ${anyBinsStatus}`);
		}
		if (hook.requirements.env.length > 0) {
			const envStatus = hook.requirements.env.map((env) => {
				return hook.missing.env.includes(env) ? theme.error(`✗ ${env}`) : theme.success(`✓ ${env}`);
			});
			lines.push(`${theme.muted("  Environment:")} ${envStatus.join(", ")}`);
		}
		if (hook.requirements.config.length > 0) {
			const configStatus = hook.configChecks.map((check) => {
				return check.satisfied ? theme.success(`✓ ${check.path}`) : theme.error(`✗ ${check.path}`);
			});
			lines.push(`${theme.muted("  Config:")} ${configStatus.join(", ")}`);
		}
		if (hook.requirements.os.length > 0) {
			const osStatus = hook.missing.os.length > 0 ? theme.error(`✗ (${hook.requirements.os.join(", ")})`) : theme.success(`✓ (${hook.requirements.os.join(", ")})`);
			lines.push(`${theme.muted("  OS:")} ${osStatus}`);
		}
	}
	return lines.join("\n");
}
/**
* Format check output
*/
function formatHooksCheck(report, opts) {
	if (opts.json) {
		const eligible = report.hooks.filter((h) => h.eligible);
		const notEligible = report.hooks.filter((h) => !h.eligible);
		return JSON.stringify({
			total: report.hooks.length,
			eligible: eligible.length,
			notEligible: notEligible.length,
			hooks: {
				eligible: eligible.map((h) => h.name),
				notEligible: notEligible.map((h) => ({
					name: h.name,
					missing: h.missing
				}))
			}
		}, null, 2);
	}
	const eligible = report.hooks.filter((h) => h.eligible);
	const notEligible = report.hooks.filter((h) => !h.eligible);
	const lines = [];
	lines.push(theme.heading("Hooks Status"));
	lines.push("");
	lines.push(`${theme.muted("Total hooks:")} ${report.hooks.length}`);
	lines.push(`${theme.success("Ready:")} ${eligible.length}`);
	lines.push(`${theme.warn("Not ready:")} ${notEligible.length}`);
	if (notEligible.length > 0) {
		lines.push("");
		lines.push(theme.heading("Hooks not ready:"));
		for (const hook of notEligible) {
			const reasons = [];
			if (hook.disabled) reasons.push("disabled");
			if (hook.missing.bins.length > 0) reasons.push(`bins: ${hook.missing.bins.join(", ")}`);
			if (hook.missing.anyBins.length > 0) reasons.push(`anyBins: ${hook.missing.anyBins.join(", ")}`);
			if (hook.missing.env.length > 0) reasons.push(`env: ${hook.missing.env.join(", ")}`);
			if (hook.missing.config.length > 0) reasons.push(`config: ${hook.missing.config.join(", ")}`);
			if (hook.missing.os.length > 0) reasons.push(`os: ${hook.missing.os.join(", ")}`);
			lines.push(`  ${hook.emoji ?? "🔗"} ${hook.name} - ${reasons.join("; ")}`);
		}
	}
	return lines.join("\n");
}
async function enableHook(hookName) {
	const config = loadConfig();
	const hook = resolveHookForToggle(buildHooksReport(config), hookName, { requireEligible: true });
	await writeConfigFile(buildConfigWithHookEnabled({
		config,
		hookName,
		enabled: true,
		ensureHooksEnabled: true
	}));
	defaultRuntime.log(`${theme.success("✓")} Enabled hook: ${hook.emoji ?? "🔗"} ${theme.command(hookName)}`);
}
async function disableHook(hookName) {
	const config = loadConfig();
	const hook = resolveHookForToggle(buildHooksReport(config), hookName);
	await writeConfigFile(buildConfigWithHookEnabled({
		config,
		hookName,
		enabled: false
	}));
	defaultRuntime.log(`${theme.warn("⏸")} Disabled hook: ${hook.emoji ?? "🔗"} ${theme.command(hookName)}`);
}
function registerHooksCli(program) {
	const hooks = program.command("hooks").description("Manage internal agent hooks").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/hooks", "docs.openclaw.ai/cli/hooks")}\n`);
	hooks.command("list").description("List all hooks").option("--eligible", "Show only eligible hooks", false).option("--json", "Output as JSON", false).option("-v, --verbose", "Show more details including missing requirements", false).action(async (opts) => runHooksCliAction(async () => {
		const report = buildHooksReport(loadConfig());
		defaultRuntime.log(formatHooksList(report, opts));
	}));
	hooks.command("info <name>").description("Show detailed information about a hook").option("--json", "Output as JSON", false).action(async (name, opts) => runHooksCliAction(async () => {
		const report = buildHooksReport(loadConfig());
		defaultRuntime.log(formatHookInfo(report, name, opts));
	}));
	hooks.command("check").description("Check hooks eligibility status").option("--json", "Output as JSON", false).action(async (opts) => runHooksCliAction(async () => {
		const report = buildHooksReport(loadConfig());
		defaultRuntime.log(formatHooksCheck(report, opts));
	}));
	hooks.command("enable <name>").description("Enable a hook").action(async (name) => runHooksCliAction(async () => {
		await enableHook(name);
	}));
	hooks.command("disable <name>").description("Disable a hook").action(async (name) => runHooksCliAction(async () => {
		await disableHook(name);
	}));
	hooks.command("install").description("Install a hook pack (path, archive, or npm spec)").argument("<path-or-spec>", "Path to a hook pack or npm package spec").option("-l, --link", "Link a local path instead of copying", false).option("--pin", "Record npm installs as exact resolved <name>@<version>", false).action(async (raw, opts) => {
		const resolved = resolveUserPath(raw);
		const cfg = loadConfig();
		if (fs.existsSync(resolved)) {
			if (opts.link) {
				if (!fs.statSync(resolved).isDirectory()) {
					defaultRuntime.error("Linked hook paths must be directories.");
					process.exit(1);
				}
				const existing = cfg.hooks?.internal?.load?.extraDirs ?? [];
				const merged = Array.from(new Set([...existing, resolved]));
				const probe = await installHooksFromPath({
					path: resolved,
					dryRun: true
				});
				if (!probe.ok) {
					defaultRuntime.error(probe.error);
					process.exit(1);
				}
				let next = {
					...cfg,
					hooks: {
						...cfg.hooks,
						internal: {
							...cfg.hooks?.internal,
							enabled: true,
							load: {
								...cfg.hooks?.internal?.load,
								extraDirs: merged
							}
						}
					}
				};
				next = enableInternalHookEntries(next, probe.hooks);
				next = recordHookInstall(next, {
					hookId: probe.hookPackId,
					source: "path",
					sourcePath: resolved,
					installPath: resolved,
					version: probe.version,
					hooks: probe.hooks
				});
				await writeConfigFile(next);
				defaultRuntime.log(`Linked hook path: ${shortenHomePath(resolved)}`);
				logGatewayRestartHint();
				return;
			}
			const result = await installHooksFromPath({
				path: resolved,
				logger: createInstallLogger()
			});
			if (!result.ok) {
				defaultRuntime.error(result.error);
				process.exit(1);
			}
			let next = enableInternalHookEntries(cfg, result.hooks);
			const source = resolveArchiveKind(resolved) ? "archive" : "path";
			next = recordHookInstall(next, {
				hookId: result.hookPackId,
				source,
				sourcePath: resolved,
				installPath: result.targetDir,
				version: result.version,
				hooks: result.hooks
			});
			await writeConfigFile(next);
			defaultRuntime.log(`Installed hooks: ${result.hooks.join(", ")}`);
			logGatewayRestartHint();
			return;
		}
		if (opts.link) {
			defaultRuntime.error("`--link` requires a local path.");
			process.exit(1);
		}
		if (raw.startsWith(".") || raw.startsWith("~") || path.isAbsolute(raw) || raw.endsWith(".zip") || raw.endsWith(".tgz") || raw.endsWith(".tar.gz") || raw.endsWith(".tar")) {
			defaultRuntime.error(`Path not found: ${resolved}`);
			process.exit(1);
		}
		const result = await installHooksFromNpmSpec({
			spec: raw,
			logger: createInstallLogger()
		});
		if (!result.ok) {
			defaultRuntime.error(result.error);
			process.exit(1);
		}
		let next = enableInternalHookEntries(cfg, result.hooks);
		const resolvedSpec = result.npmResolution?.resolvedSpec;
		const recordSpec = opts.pin && resolvedSpec ? resolvedSpec : raw;
		if (opts.pin && !resolvedSpec) defaultRuntime.log(theme.warn("Could not resolve exact npm version for --pin; storing original npm spec."));
		if (opts.pin && resolvedSpec) defaultRuntime.log(`Pinned npm install record to ${resolvedSpec}.`);
		next = recordHookInstall(next, {
			hookId: result.hookPackId,
			source: "npm",
			spec: recordSpec,
			installPath: result.targetDir,
			version: result.version,
			resolvedName: result.npmResolution?.name,
			resolvedVersion: result.npmResolution?.version,
			resolvedSpec: result.npmResolution?.resolvedSpec,
			integrity: result.npmResolution?.integrity,
			shasum: result.npmResolution?.shasum,
			resolvedAt: result.npmResolution?.resolvedAt,
			hooks: result.hooks
		});
		await writeConfigFile(next);
		defaultRuntime.log(`Installed hooks: ${result.hooks.join(", ")}`);
		logGatewayRestartHint();
	});
	hooks.command("update").description("Update installed hooks (npm installs only)").argument("[id]", "Hook pack id (omit with --all)").option("--all", "Update all tracked hooks", false).option("--dry-run", "Show what would change without writing", false).action(async (id, opts) => {
		const cfg = loadConfig();
		const installs = cfg.hooks?.internal?.installs ?? {};
		const targets = opts.all ? Object.keys(installs) : id ? [id] : [];
		if (targets.length === 0) {
			defaultRuntime.error("Provide a hook id or use --all.");
			process.exit(1);
		}
		let nextCfg = cfg;
		let updatedCount = 0;
		for (const hookId of targets) {
			const record = installs[hookId];
			if (!record) {
				defaultRuntime.log(theme.warn(`No install record for "${hookId}".`));
				continue;
			}
			if (record.source !== "npm") {
				defaultRuntime.log(theme.warn(`Skipping "${hookId}" (source: ${record.source}).`));
				continue;
			}
			if (!record.spec) {
				defaultRuntime.log(theme.warn(`Skipping "${hookId}" (missing npm spec).`));
				continue;
			}
			let installPath;
			try {
				installPath = record.installPath ?? resolveHookInstallDir(hookId);
			} catch (err) {
				defaultRuntime.log(theme.error(`Invalid install path for "${hookId}": ${String(err)}`));
				continue;
			}
			const currentVersion = await readInstalledPackageVersion(installPath);
			if (opts.dryRun) {
				const probe = await installHooksFromNpmSpec({
					spec: record.spec,
					mode: "update",
					dryRun: true,
					expectedHookPackId: hookId,
					expectedIntegrity: record.integrity,
					onIntegrityDrift: async (drift) => {
						const specLabel = drift.resolution.resolvedSpec ?? drift.spec;
						defaultRuntime.log(theme.warn(`Integrity drift detected for "${hookId}" (${specLabel})\nExpected: ${drift.expectedIntegrity}\nActual:   ${drift.actualIntegrity}`));
						return true;
					},
					logger: createInstallLogger()
				});
				if (!probe.ok) {
					defaultRuntime.log(theme.error(`Failed to check ${hookId}: ${probe.error}`));
					continue;
				}
				const nextVersion = probe.version ?? "unknown";
				const currentLabel = currentVersion ?? "unknown";
				if (currentVersion && probe.version && currentVersion === probe.version) defaultRuntime.log(`${hookId} is up to date (${currentLabel}).`);
				else defaultRuntime.log(`Would update ${hookId}: ${currentLabel} → ${nextVersion}.`);
				continue;
			}
			const result = await installHooksFromNpmSpec({
				spec: record.spec,
				mode: "update",
				expectedHookPackId: hookId,
				expectedIntegrity: record.integrity,
				onIntegrityDrift: async (drift) => {
					const specLabel = drift.resolution.resolvedSpec ?? drift.spec;
					defaultRuntime.log(theme.warn(`Integrity drift detected for "${hookId}" (${specLabel})\nExpected: ${drift.expectedIntegrity}\nActual:   ${drift.actualIntegrity}`));
					return await promptYesNo(`Continue updating "${hookId}" with this artifact?`);
				},
				logger: createInstallLogger()
			});
			if (!result.ok) {
				defaultRuntime.log(theme.error(`Failed to update ${hookId}: ${result.error}`));
				continue;
			}
			const nextVersion = result.version ?? await readInstalledPackageVersion(result.targetDir);
			nextCfg = recordHookInstall(nextCfg, {
				hookId,
				source: "npm",
				spec: record.spec,
				installPath: result.targetDir,
				version: nextVersion,
				resolvedName: result.npmResolution?.name,
				resolvedVersion: result.npmResolution?.version,
				resolvedSpec: result.npmResolution?.resolvedSpec,
				integrity: result.npmResolution?.integrity,
				shasum: result.npmResolution?.shasum,
				resolvedAt: result.npmResolution?.resolvedAt,
				hooks: result.hooks
			});
			updatedCount += 1;
			const currentLabel = currentVersion ?? "unknown";
			const nextLabel = nextVersion ?? "unknown";
			if (currentVersion && nextVersion && currentVersion === nextVersion) defaultRuntime.log(`${hookId} already at ${currentLabel}.`);
			else defaultRuntime.log(`Updated ${hookId}: ${currentLabel} → ${nextLabel}.`);
		}
		if (updatedCount > 0) {
			await writeConfigFile(nextCfg);
			logGatewayRestartHint();
		}
	});
	hooks.action(async () => runHooksCliAction(async () => {
		const report = buildHooksReport(loadConfig());
		defaultRuntime.log(formatHooksList(report, {}));
	}));
}

//#endregion
export { registerHooksCli };