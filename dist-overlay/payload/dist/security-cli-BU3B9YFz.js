import { $t as resolveStateDir, Dt as isRich, Ot as theme, Ut as resolveConfigPath, Zt as resolveOAuthDir, lt as shortenHomeInString, ut as shortenHomePath, v as defaultRuntime } from "./entry.js";
import "./auth-profiles-VHiPC1-T.js";
import { t as formatCliCommand } from "./command-format-BCo5X8vD.js";
import { d as resolveDefaultAgentId } from "./agent-scope-DhI_kPU3.js";
import { s as normalizeAgentId } from "./session-key-DIABCrXz.js";
import { n as runExec } from "./exec-TIZD7ZZn.js";
import "./github-copilot-token-DKRiM6oj.js";
import "./host-env-security-DyQuUnEd.js";
import "./frontmatter-17nP3KZr.js";
import "./skills-M3ShrlYm.js";
import "./manifest-registry-BgY5xgMH.js";
import { i as loadConfig, r as createConfigIO } from "./config-CaJqgOvf.js";
import "./env-vars-iFkEK4MO.js";
import "./dock-D4HTBK6f.js";
import "./message-channel-CIQTys4Q.js";
import "./sessions-r0eCG3qK.js";
import "./plugins-DS5tNvig.js";
import "./accounts-Q2sI0yx1.js";
import "./accounts-DTV7qtJm.js";
import "./accounts-Bgj4wZaj.js";
import "./bindings-BJckG653.js";
import "./logging-CFvkxgcX.js";
import "./paths-DDT5WL2f.js";
import "./chat-envelope-BG_U_muK.js";
import "./client-Bkvpx3HG.js";
import "./call-HfQjDsxN.js";
import "./pairing-token-CtND5y_8.js";
import "./net-C5Xzxz5G.js";
import "./ip-CyOZe5YF.js";
import "./tailnet-CC0kbSg4.js";
import "./image-ops-BtM0q_Kl.js";
import "./sandbox-OR4o76Qx.js";
import "./tool-catalog-BS-Gk_Yg.js";
import "./chrome-DoHC6NEx.js";
import "./tailscale-BIikm3VQ.js";
import "./auth-uSllFIea.js";
import "./server-context-CWN_iNA_.js";
import "./redact-Dcypez3H.js";
import "./errors-Cu3BYw29.js";
import "./fs-safe-Cwp1VOPx.js";
import "./paths-Dm4w47Dx.js";
import "./ssrf-D2dYwtfF.js";
import "./store-BnzosEtE.js";
import "./ports-DcKmwJ_3.js";
import "./trash-BqYFVJft.js";
import "./server-middleware-CjPPadc3.js";
import "./exec-approvals-allowlist-BFdIZcKM.js";
import "./exec-safe-bin-runtime-policy-hoJHNODP.js";
import "./commands-pdOUas3E.js";
import { i as readChannelAllowFromStore } from "./pairing-store-C9G8zMVO.js";
import "./workspace-dirs-CXaWreqW.js";
import { t as formatDocsLink } from "./links-DfYXF6CQ.js";
import { t as formatHelpExamples } from "./help-format-Yb22e8jt.js";
import "./pi-tools.policy-ITFWKxH-.js";
import "./dangerous-tools-hRFa_Eo2.js";
import "./skill-scanner-rxv47u6f.js";
import { a as collectIncludePathsRecursive, i as formatIcaclsResetCommand, r as createIcaclsResetCommand, t as runSecurityAudit } from "./audit-DVU7F7a7.js";
import path from "node:path";
import fs from "node:fs/promises";

//#region src/security/fix.ts
async function safeChmod(params) {
	try {
		const st = await fs.lstat(params.path);
		if (st.isSymbolicLink()) return {
			kind: "chmod",
			path: params.path,
			mode: params.mode,
			ok: false,
			skipped: "symlink"
		};
		if (params.require === "dir" && !st.isDirectory()) return {
			kind: "chmod",
			path: params.path,
			mode: params.mode,
			ok: false,
			skipped: "not-a-directory"
		};
		if (params.require === "file" && !st.isFile()) return {
			kind: "chmod",
			path: params.path,
			mode: params.mode,
			ok: false,
			skipped: "not-a-file"
		};
		if ((st.mode & 511) === params.mode) return {
			kind: "chmod",
			path: params.path,
			mode: params.mode,
			ok: false,
			skipped: "already"
		};
		await fs.chmod(params.path, params.mode);
		return {
			kind: "chmod",
			path: params.path,
			mode: params.mode,
			ok: true
		};
	} catch (err) {
		if (err.code === "ENOENT") return {
			kind: "chmod",
			path: params.path,
			mode: params.mode,
			ok: false,
			skipped: "missing"
		};
		return {
			kind: "chmod",
			path: params.path,
			mode: params.mode,
			ok: false,
			error: String(err)
		};
	}
}
async function safeAclReset(params) {
	const display = formatIcaclsResetCommand(params.path, {
		isDir: params.require === "dir",
		env: params.env
	});
	try {
		const st = await fs.lstat(params.path);
		if (st.isSymbolicLink()) return {
			kind: "icacls",
			path: params.path,
			command: display,
			ok: false,
			skipped: "symlink"
		};
		if (params.require === "dir" && !st.isDirectory()) return {
			kind: "icacls",
			path: params.path,
			command: display,
			ok: false,
			skipped: "not-a-directory"
		};
		if (params.require === "file" && !st.isFile()) return {
			kind: "icacls",
			path: params.path,
			command: display,
			ok: false,
			skipped: "not-a-file"
		};
		const cmd = createIcaclsResetCommand(params.path, {
			isDir: st.isDirectory(),
			env: params.env
		});
		if (!cmd) return {
			kind: "icacls",
			path: params.path,
			command: display,
			ok: false,
			skipped: "missing-user"
		};
		await (params.exec ?? runExec)(cmd.command, cmd.args);
		return {
			kind: "icacls",
			path: params.path,
			command: cmd.display,
			ok: true
		};
	} catch (err) {
		if (err.code === "ENOENT") return {
			kind: "icacls",
			path: params.path,
			command: display,
			ok: false,
			skipped: "missing"
		};
		return {
			kind: "icacls",
			path: params.path,
			command: display,
			ok: false,
			error: String(err)
		};
	}
}
function setGroupPolicyAllowlist(params) {
	if (!params.cfg.channels) return;
	const section = params.cfg.channels[params.channel];
	if (!section || typeof section !== "object") return;
	if (section.groupPolicy === "open") {
		section.groupPolicy = "allowlist";
		params.changes.push(`channels.${params.channel}.groupPolicy=open -> allowlist`);
		params.policyFlips.add(`channels.${params.channel}.`);
	}
	const accounts = section.accounts;
	if (!accounts || typeof accounts !== "object") return;
	for (const [accountId, accountValue] of Object.entries(accounts)) {
		if (!accountId) continue;
		if (!accountValue || typeof accountValue !== "object") continue;
		const account = accountValue;
		if (account.groupPolicy === "open") {
			account.groupPolicy = "allowlist";
			params.changes.push(`channels.${params.channel}.accounts.${accountId}.groupPolicy=open -> allowlist`);
			params.policyFlips.add(`channels.${params.channel}.accounts.${accountId}.`);
		}
	}
}
function setWhatsAppGroupAllowFromFromStore(params) {
	const section = params.cfg.channels?.whatsapp;
	if (!section || typeof section !== "object") return;
	if (params.storeAllowFrom.length === 0) return;
	const maybeApply = (prefix, obj) => {
		if (!params.policyFlips.has(prefix)) return;
		const allowFrom = Array.isArray(obj.allowFrom) ? obj.allowFrom : [];
		const groupAllowFrom = Array.isArray(obj.groupAllowFrom) ? obj.groupAllowFrom : [];
		if (allowFrom.length > 0) return;
		if (groupAllowFrom.length > 0) return;
		obj.groupAllowFrom = params.storeAllowFrom;
		params.changes.push(`${prefix}groupAllowFrom=pairing-store`);
	};
	maybeApply("channels.whatsapp.", section);
	const accounts = section.accounts;
	if (!accounts || typeof accounts !== "object") return;
	for (const [accountId, accountValue] of Object.entries(accounts)) {
		if (!accountValue || typeof accountValue !== "object") continue;
		const account = accountValue;
		maybeApply(`channels.whatsapp.accounts.${accountId}.`, account);
	}
}
function applyConfigFixes(params) {
	const next = structuredClone(params.cfg ?? {});
	const changes = [];
	const policyFlips = /* @__PURE__ */ new Set();
	if (next.logging?.redactSensitive === "off") {
		next.logging = {
			...next.logging,
			redactSensitive: "tools"
		};
		changes.push("logging.redactSensitive=off -> \"tools\"");
	}
	for (const channel of [
		"telegram",
		"whatsapp",
		"discord",
		"signal",
		"imessage",
		"slack",
		"msteams"
	]) setGroupPolicyAllowlist({
		cfg: next,
		channel,
		changes,
		policyFlips
	});
	return {
		cfg: next,
		changes,
		policyFlips
	};
}
async function chmodCredentialsAndAgentState(params) {
	const credsDir = resolveOAuthDir(params.env, params.stateDir);
	params.actions.push(await safeChmod({
		path: credsDir,
		mode: 448,
		require: "dir"
	}));
	const credsEntries = await fs.readdir(credsDir, { withFileTypes: true }).catch(() => []);
	for (const entry of credsEntries) {
		if (!entry.isFile()) continue;
		if (!entry.name.endsWith(".json")) continue;
		const p = path.join(credsDir, entry.name);
		params.actions.push(await safeChmod({
			path: p,
			mode: 384,
			require: "file"
		}));
	}
	const ids = /* @__PURE__ */ new Set();
	ids.add(resolveDefaultAgentId(params.cfg));
	const list = Array.isArray(params.cfg.agents?.list) ? params.cfg.agents?.list : [];
	for (const agent of list ?? []) {
		if (!agent || typeof agent !== "object") continue;
		const id = typeof agent.id === "string" ? agent.id.trim() : "";
		if (id) ids.add(id);
	}
	for (const agentId of ids) {
		const normalizedAgentId = normalizeAgentId(agentId);
		const agentRoot = path.join(params.stateDir, "agents", normalizedAgentId);
		const agentDir = path.join(agentRoot, "agent");
		const sessionsDir = path.join(agentRoot, "sessions");
		params.actions.push(await safeChmod({
			path: agentRoot,
			mode: 448,
			require: "dir"
		}));
		params.actions.push(await params.applyPerms({
			path: agentDir,
			mode: 448,
			require: "dir"
		}));
		const authPath = path.join(agentDir, "auth-profiles.json");
		params.actions.push(await params.applyPerms({
			path: authPath,
			mode: 384,
			require: "file"
		}));
		params.actions.push(await params.applyPerms({
			path: sessionsDir,
			mode: 448,
			require: "dir"
		}));
		const storePath = path.join(sessionsDir, "sessions.json");
		params.actions.push(await params.applyPerms({
			path: storePath,
			mode: 384,
			require: "file"
		}));
		const sessionEntries = await fs.readdir(sessionsDir, { withFileTypes: true }).catch(() => []);
		for (const entry of sessionEntries) {
			if (!entry.isFile()) continue;
			if (!entry.name.endsWith(".jsonl")) continue;
			const p = path.join(sessionsDir, entry.name);
			params.actions.push(await params.applyPerms({
				path: p,
				mode: 384,
				require: "file"
			}));
		}
	}
}
async function fixSecurityFootguns(opts) {
	const env = opts?.env ?? process.env;
	const platform = opts?.platform ?? process.platform;
	const exec = opts?.exec ?? runExec;
	const isWindows = platform === "win32";
	const stateDir = opts?.stateDir ?? resolveStateDir(env);
	const configPath = opts?.configPath ?? resolveConfigPath(env, stateDir);
	const actions = [];
	const errors = [];
	const io = createConfigIO({
		env,
		configPath
	});
	const snap = await io.readConfigFileSnapshot();
	if (!snap.valid) errors.push(...snap.issues.map((i) => `${i.path}: ${i.message}`));
	let configWritten = false;
	let changes = [];
	if (snap.valid) {
		const fixed = applyConfigFixes({
			cfg: snap.config,
			env
		});
		changes = fixed.changes;
		const whatsappStoreAllowFrom = await readChannelAllowFromStore("whatsapp", env).catch(() => []);
		if (whatsappStoreAllowFrom.length > 0) setWhatsAppGroupAllowFromFromStore({
			cfg: fixed.cfg,
			storeAllowFrom: whatsappStoreAllowFrom,
			changes,
			policyFlips: fixed.policyFlips
		});
		if (changes.length > 0) try {
			await io.writeConfigFile(fixed.cfg);
			configWritten = true;
		} catch (err) {
			errors.push(`writeConfigFile failed: ${String(err)}`);
		}
	}
	const applyPerms = (params) => isWindows ? safeAclReset({
		path: params.path,
		require: params.require,
		env,
		exec
	}) : safeChmod({
		path: params.path,
		mode: params.mode,
		require: params.require
	});
	actions.push(await applyPerms({
		path: stateDir,
		mode: 448,
		require: "dir"
	}));
	actions.push(await applyPerms({
		path: configPath,
		mode: 384,
		require: "file"
	}));
	if (snap.exists) {
		const includePaths = await collectIncludePathsRecursive({
			configPath: snap.path,
			parsed: snap.parsed
		}).catch(() => []);
		for (const p of includePaths) actions.push(await applyPerms({
			path: p,
			mode: 384,
			require: "file"
		}));
	}
	await chmodCredentialsAndAgentState({
		env,
		stateDir,
		cfg: snap.config ?? {},
		actions,
		applyPerms
	}).catch((err) => {
		errors.push(`chmodCredentialsAndAgentState failed: ${String(err)}`);
	});
	return {
		ok: errors.length === 0,
		stateDir,
		configPath,
		configWritten,
		changes,
		actions,
		errors
	};
}

//#endregion
//#region src/cli/security-cli.ts
function formatSummary(summary) {
	const rich = isRich();
	const c = summary.critical;
	const w = summary.warn;
	const i = summary.info;
	const parts = [];
	parts.push(rich ? theme.error(`${c} critical`) : `${c} critical`);
	parts.push(rich ? theme.warn(`${w} warn`) : `${w} warn`);
	parts.push(rich ? theme.muted(`${i} info`) : `${i} info`);
	return parts.join(" · ");
}
function registerSecurityCli(program) {
	program.command("security").description("Audit local config and state for common security foot-guns").addHelpText("after", () => `\n${theme.heading("Examples:")}\n${formatHelpExamples([
		["openclaw security audit", "Run a local security audit."],
		["openclaw security audit --deep", "Include best-effort live Gateway probe checks."],
		["openclaw security audit --fix", "Apply safe remediations and file-permission fixes."],
		["openclaw security audit --json", "Output machine-readable JSON."]
	])}\n\n${theme.muted("Docs:")} ${formatDocsLink("/cli/security", "docs.openclaw.ai/cli/security")}\n`).command("audit").description("Audit config + local state for common security foot-guns").option("--deep", "Attempt live Gateway probe (best-effort)", false).option("--fix", "Apply safe fixes (tighten defaults + chmod state/config)", false).option("--json", "Print JSON", false).action(async (opts) => {
		const fixResult = opts.fix ? await fixSecurityFootguns().catch((_err) => null) : null;
		const report = await runSecurityAudit({
			config: loadConfig(),
			deep: Boolean(opts.deep),
			includeFilesystem: true,
			includeChannelSecurity: true
		});
		if (opts.json) {
			defaultRuntime.log(JSON.stringify(fixResult ? {
				fix: fixResult,
				report
			} : report, null, 2));
			return;
		}
		const rich = isRich();
		const heading = (text) => rich ? theme.heading(text) : text;
		const muted = (text) => rich ? theme.muted(text) : text;
		const lines = [];
		lines.push(heading("OpenClaw security audit"));
		lines.push(muted(`Summary: ${formatSummary(report.summary)}`));
		lines.push(muted(`Run deeper: ${formatCliCommand("openclaw security audit --deep")}`));
		if (opts.fix) {
			lines.push(muted(`Fix: ${formatCliCommand("openclaw security audit --fix")}`));
			if (!fixResult) lines.push(muted("Fixes: failed to apply (unexpected error)"));
			else if (fixResult.errors.length === 0 && fixResult.changes.length === 0 && fixResult.actions.every((a) => !a.ok)) lines.push(muted("Fixes: no changes applied"));
			else {
				lines.push("");
				lines.push(heading("FIX"));
				for (const change of fixResult.changes) lines.push(muted(`  ${shortenHomeInString(change)}`));
				for (const action of fixResult.actions) {
					if (action.kind === "chmod") {
						const mode = action.mode.toString(8).padStart(3, "0");
						if (action.ok) lines.push(muted(`  chmod ${mode} ${shortenHomePath(action.path)}`));
						else if (action.skipped) lines.push(muted(`  skip chmod ${mode} ${shortenHomePath(action.path)} (${action.skipped})`));
						else if (action.error) lines.push(muted(`  chmod ${mode} ${shortenHomePath(action.path)} failed: ${action.error}`));
						continue;
					}
					const command = shortenHomeInString(action.command);
					if (action.ok) lines.push(muted(`  ${command}`));
					else if (action.skipped) lines.push(muted(`  skip ${command} (${action.skipped})`));
					else if (action.error) lines.push(muted(`  ${command} failed: ${action.error}`));
				}
				if (fixResult.errors.length > 0) for (const err of fixResult.errors) lines.push(muted(`  error: ${shortenHomeInString(err)}`));
			}
		}
		const bySeverity = (sev) => report.findings.filter((f) => f.severity === sev);
		const render = (sev) => {
			const list = bySeverity(sev);
			if (list.length === 0) return;
			const label = sev === "critical" ? rich ? theme.error("CRITICAL") : "CRITICAL" : sev === "warn" ? rich ? theme.warn("WARN") : "WARN" : rich ? theme.muted("INFO") : "INFO";
			lines.push("");
			lines.push(heading(label));
			for (const f of list) {
				lines.push(`${theme.muted(f.checkId)} ${f.title}`);
				lines.push(`  ${f.detail}`);
				if (f.remediation?.trim()) lines.push(`  ${muted(`Fix: ${f.remediation.trim()}`)}`);
			}
		};
		render("critical");
		render("warn");
		render("info");
		defaultRuntime.log(lines.join("\n"));
	});
}

//#endregion
export { registerSecurityCli };