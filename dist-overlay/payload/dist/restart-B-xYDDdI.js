import { k as resolvePreferredOpenClawTmpDir } from "./globals-Bv4ZcVWM.js";
import { u as resolveGatewayPort } from "./paths-BfR2LXbA.js";
import { t as createSubsystemLogger } from "./subsystem-Cf9yS0UI.js";
import { i as resolveLsofCommandSync } from "./ports-DOBLq-G-.js";
import { m as resolveGatewayWindowsTaskName, p as resolveGatewaySystemdServiceName, u as resolveGatewayLaunchAgentLabel } from "./arg-split-DJKZOqeG.js";
import { n as quoteCmdScriptArg } from "./cmd-argv-DfzL-jVU.js";
import { spawn, spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
//#region src/process/kill-tree.ts
const DEFAULT_GRACE_MS = 3e3;
const MAX_GRACE_MS = 6e4;
/**
* Best-effort process-tree termination with graceful shutdown.
* - Windows: use taskkill /T to include descendants. Sends SIGTERM-equivalent
*   first (without /F), then force-kills if process survives.
* - Unix: send SIGTERM to process group first, wait grace period, then SIGKILL.
*
* This gives child processes a chance to clean up (close connections, remove
* temp files, terminate their own children) before being hard-killed.
*/
function killProcessTree(pid, opts) {
	if (!Number.isFinite(pid) || pid <= 0) return;
	const graceMs = normalizeGraceMs(opts?.graceMs);
	if (process.platform === "win32") {
		killProcessTreeWindows(pid, graceMs);
		return;
	}
	killProcessTreeUnix(pid, graceMs);
}
function normalizeGraceMs(value) {
	if (typeof value !== "number" || !Number.isFinite(value)) return DEFAULT_GRACE_MS;
	return Math.max(0, Math.min(MAX_GRACE_MS, Math.floor(value)));
}
function isProcessAlive(pid) {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}
function killProcessTreeUnix(pid, graceMs) {
	try {
		process.kill(-pid, "SIGTERM");
	} catch {
		try {
			process.kill(pid, "SIGTERM");
		} catch {
			return;
		}
	}
	setTimeout(() => {
		if (isProcessAlive(-pid)) try {
			process.kill(-pid, "SIGKILL");
			return;
		} catch {}
		if (!isProcessAlive(pid)) return;
		try {
			process.kill(pid, "SIGKILL");
		} catch {}
	}, graceMs).unref();
}
function runTaskkill(args) {
	try {
		spawn("taskkill", args, {
			stdio: "ignore",
			detached: true
		});
	} catch {}
}
function killProcessTreeWindows(pid, graceMs) {
	runTaskkill([
		"/T",
		"/PID",
		String(pid)
	]);
	setTimeout(() => {
		if (!isProcessAlive(pid)) return;
		runTaskkill([
			"/F",
			"/T",
			"/PID",
			String(pid)
		]);
	}, graceMs).unref();
}
//#endregion
//#region src/infra/restart-stale-pids.ts
const SPAWN_TIMEOUT_MS$1 = 2e3;
const STALE_SIGTERM_WAIT_MS = 600;
const STALE_SIGKILL_WAIT_MS = 400;
/**
* After SIGKILL, the kernel may not release the TCP port immediately.
* Poll until the port is confirmed free (or until the budget expires) before
* returning control to the caller (typically `triggerOpenClawRestart` →
* `systemctl restart`). Without this wait the new process races the dying
* process for the port and systemd enters an EADDRINUSE restart loop.
*
* POLL_SPAWN_TIMEOUT_MS is intentionally much shorter than SPAWN_TIMEOUT_MS
* so that a single slow or hung lsof invocation does not consume the entire
* polling budget. At 400 ms per call, up to five independent lsof attempts
* fit within PORT_FREE_TIMEOUT_MS = 2000 ms, each with a definitive outcome.
*/
const PORT_FREE_POLL_INTERVAL_MS = 50;
const PORT_FREE_TIMEOUT_MS = 2e3;
const POLL_SPAWN_TIMEOUT_MS = 400;
const restartLog$1 = createSubsystemLogger("restart");
function getTimeMs() {
	return Date.now();
}
function sleepSync(ms) {
	const timeoutMs = Math.max(0, Math.floor(ms));
	if (timeoutMs <= 0) return;
	try {
		const lock = new Int32Array(new SharedArrayBuffer(4));
		Atomics.wait(lock, 0, 0, timeoutMs);
	} catch {
		const start = Date.now();
		while (Date.now() - start < timeoutMs);
	}
}
/**
* Parse openclaw gateway PIDs from lsof -Fpc stdout.
* Pure function — no I/O. Excludes the current process.
*/
function parsePidsFromLsofOutput(stdout) {
	const pids = [];
	let currentPid;
	let currentCmd;
	for (const line of stdout.split(/\r?\n/).filter(Boolean)) if (line.startsWith("p")) {
		if (currentPid != null && currentCmd && currentCmd.toLowerCase().includes("openclaw")) pids.push(currentPid);
		const parsed = Number.parseInt(line.slice(1), 10);
		currentPid = Number.isFinite(parsed) && parsed > 0 ? parsed : void 0;
		currentCmd = void 0;
	} else if (line.startsWith("c")) currentCmd = line.slice(1);
	if (currentPid != null && currentCmd && currentCmd.toLowerCase().includes("openclaw")) pids.push(currentPid);
	return [...new Set(pids)].filter((pid) => pid !== process.pid);
}
/**
* Find PIDs of gateway processes listening on the given port using synchronous lsof.
* Returns only PIDs that belong to openclaw gateway processes (not the current process).
*/
function findGatewayPidsOnPortSync(port, spawnTimeoutMs = SPAWN_TIMEOUT_MS$1) {
	if (process.platform === "win32") return [];
	const res = spawnSync(resolveLsofCommandSync(), [
		"-nP",
		`-iTCP:${port}`,
		"-sTCP:LISTEN",
		"-Fpc"
	], {
		encoding: "utf8",
		timeout: spawnTimeoutMs
	});
	if (res.error) {
		const code = res.error.code;
		const detail = code && code.trim().length > 0 ? code : res.error instanceof Error ? res.error.message : "unknown error";
		restartLog$1.warn(`lsof failed during initial stale-pid scan for port ${port}: ${detail}`);
		return [];
	}
	if (res.status === 1) return [];
	if (res.status !== 0) {
		restartLog$1.warn(`lsof exited with status ${res.status} during initial stale-pid scan for port ${port}; skipping stale pid check`);
		return [];
	}
	return parsePidsFromLsofOutput(res.stdout);
}
function pollPortOnce(port) {
	try {
		const res = spawnSync(resolveLsofCommandSync(), [
			"-nP",
			`-iTCP:${port}`,
			"-sTCP:LISTEN",
			"-Fpc"
		], {
			encoding: "utf8",
			timeout: POLL_SPAWN_TIMEOUT_MS
		});
		if (res.error) {
			const code = res.error.code;
			return {
				free: null,
				permanent: code === "ENOENT" || code === "EACCES" || code === "EPERM"
			};
		}
		if (res.status === 1) {
			if (res.stdout) return parsePidsFromLsofOutput(res.stdout).length === 0 ? { free: true } : { free: false };
			return { free: true };
		}
		if (res.status !== 0) return {
			free: null,
			permanent: false
		};
		return parsePidsFromLsofOutput(res.stdout).length === 0 ? { free: true } : { free: false };
	} catch {
		return {
			free: null,
			permanent: false
		};
	}
}
/**
* Synchronously terminate stale gateway processes.
* Callers must pass a non-empty pids array.
* Sends SIGTERM, waits briefly, then SIGKILL for survivors.
*/
function terminateStaleProcessesSync(pids) {
	const killed = [];
	for (const pid of pids) try {
		process.kill(pid, "SIGTERM");
		killed.push(pid);
	} catch {}
	if (killed.length === 0) return killed;
	sleepSync(STALE_SIGTERM_WAIT_MS);
	for (const pid of killed) try {
		process.kill(pid, 0);
		process.kill(pid, "SIGKILL");
	} catch {}
	sleepSync(STALE_SIGKILL_WAIT_MS);
	return killed;
}
/**
* Poll the given port until it is confirmed free, lsof is confirmed unavailable,
* or the wall-clock budget expires.
*
* Each poll invocation uses POLL_SPAWN_TIMEOUT_MS (400 ms), which is
* significantly shorter than PORT_FREE_TIMEOUT_MS (2000 ms). This ensures
* that a single slow or hung lsof call cannot consume the entire polling
* budget and cause the function to exit prematurely with an inconclusive
* result. Up to five independent lsof attempts fit within the budget.
*
* Exit conditions:
*   - `pollPortOnce` returns `{ free: true }`                    → port confirmed free
*   - `pollPortOnce` returns `{ free: null, permanent: true }`   → lsof unavailable, bail
*   - `pollPortOnce` returns `{ free: false }`                   → port busy, sleep + retry
*   - `pollPortOnce` returns `{ free: null, permanent: false }`  → transient error, sleep + retry
*   - Wall-clock deadline exceeded                               → log warning, proceed anyway
*/
function waitForPortFreeSync(port) {
	const deadline = getTimeMs() + PORT_FREE_TIMEOUT_MS;
	while (getTimeMs() < deadline) {
		const result = pollPortOnce(port);
		if (result.free === true) return;
		if (result.free === null && result.permanent) return;
		sleepSync(PORT_FREE_POLL_INTERVAL_MS);
	}
	restartLog$1.warn(`port ${port} still in use after ${PORT_FREE_TIMEOUT_MS}ms; proceeding anyway`);
}
/**
* Inspect the gateway port and kill any stale gateway processes holding it.
* Blocks until the port is confirmed free (or the poll budget expires) so
* the supervisor (systemd / launchctl) does not race a zombie process for
* the port and enter an EADDRINUSE restart loop.
*
* Called before service restart commands to prevent port conflicts.
*/
function cleanStaleGatewayProcessesSync(portOverride) {
	try {
		const port = typeof portOverride === "number" && Number.isFinite(portOverride) && portOverride > 0 ? Math.floor(portOverride) : resolveGatewayPort(void 0, process.env);
		const stalePids = findGatewayPidsOnPortSync(port);
		if (stalePids.length === 0) return [];
		restartLog$1.warn(`killing ${stalePids.length} stale gateway process(es) before restart: ${stalePids.join(", ")}`);
		const killed = terminateStaleProcessesSync(stalePids);
		waitForPortFreeSync(port);
		return killed;
	} catch {
		return [];
	}
}
//#endregion
//#region src/infra/windows-task-restart.ts
const TASK_RESTART_RETRY_LIMIT = 12;
const TASK_RESTART_RETRY_DELAY_SEC = 1;
function resolveWindowsTaskName(env) {
	const override = env.OPENCLAW_WINDOWS_TASK_NAME?.trim();
	if (override) return override;
	return resolveGatewayWindowsTaskName(env.OPENCLAW_PROFILE);
}
function buildScheduledTaskRestartScript(taskName) {
	const quotedTaskName = quoteCmdScriptArg(taskName);
	return [
		"@echo off",
		"setlocal",
		"set /a attempts=0",
		":retry",
		`timeout /t ${TASK_RESTART_RETRY_DELAY_SEC} /nobreak >nul`,
		"set /a attempts+=1",
		`schtasks /Run /TN ${quotedTaskName} >nul 2>&1`,
		"if not errorlevel 1 goto cleanup",
		`if %attempts% GEQ ${TASK_RESTART_RETRY_LIMIT} goto cleanup`,
		"goto retry",
		":cleanup",
		"del \"%~f0\" >nul 2>&1"
	].join("\r\n");
}
function relaunchGatewayScheduledTask(env = process.env) {
	const taskName = resolveWindowsTaskName(env);
	const scriptPath = path.join(resolvePreferredOpenClawTmpDir(), `openclaw-schtasks-restart-${randomUUID()}.cmd`);
	const quotedScriptPath = quoteCmdScriptArg(scriptPath);
	try {
		fs.writeFileSync(scriptPath, `${buildScheduledTaskRestartScript(taskName)}\r\n`, "utf8");
		spawn("cmd.exe", [
			"/d",
			"/s",
			"/c",
			quotedScriptPath
		], {
			detached: true,
			stdio: "ignore",
			windowsHide: true
		}).unref();
		return {
			ok: true,
			method: "schtasks",
			tried: [`schtasks /Run /TN "${taskName}"`, `cmd.exe /d /s /c ${quotedScriptPath}`]
		};
	} catch (err) {
		try {
			fs.unlinkSync(scriptPath);
		} catch {}
		return {
			ok: false,
			method: "schtasks",
			detail: err instanceof Error ? err.message : String(err),
			tried: [`schtasks /Run /TN "${taskName}"`]
		};
	}
}
//#endregion
//#region src/infra/restart.ts
const SPAWN_TIMEOUT_MS = 2e3;
const SIGUSR1_AUTH_GRACE_MS = 5e3;
const DEFAULT_DEFERRAL_POLL_MS = 500;
const DEFAULT_DEFERRAL_MAX_WAIT_MS = 3e4;
const RESTART_COOLDOWN_MS = 3e4;
const restartLog = createSubsystemLogger("restart");
let sigusr1AuthorizedCount = 0;
let sigusr1AuthorizedUntil = 0;
let sigusr1ExternalAllowed = false;
let preRestartCheck = null;
let restartCycleToken = 0;
let emittedRestartToken = 0;
let consumedRestartToken = 0;
let lastRestartEmittedAt = 0;
let pendingRestartTimer = null;
let pendingRestartDueAt = 0;
let pendingRestartReason;
function hasUnconsumedRestartSignal() {
	return emittedRestartToken > consumedRestartToken;
}
function clearPendingScheduledRestart() {
	if (pendingRestartTimer) clearTimeout(pendingRestartTimer);
	pendingRestartTimer = null;
	pendingRestartDueAt = 0;
	pendingRestartReason = void 0;
}
function summarizeChangedPaths(paths, maxPaths = 6) {
	if (!Array.isArray(paths) || paths.length === 0) return null;
	if (paths.length <= maxPaths) return paths.join(",");
	return `${paths.slice(0, maxPaths).join(",")},+${paths.length - maxPaths} more`;
}
function formatRestartAudit(audit) {
	const actor = typeof audit?.actor === "string" && audit.actor.trim() ? audit.actor.trim() : null;
	const deviceId = typeof audit?.deviceId === "string" && audit.deviceId.trim() ? audit.deviceId.trim() : null;
	const clientIp = typeof audit?.clientIp === "string" && audit.clientIp.trim() ? audit.clientIp.trim() : null;
	const changed = summarizeChangedPaths(audit?.changedPaths);
	const fields = [];
	if (actor) fields.push(`actor=${actor}`);
	if (deviceId) fields.push(`device=${deviceId}`);
	if (clientIp) fields.push(`ip=${clientIp}`);
	if (changed) fields.push(`changedPaths=${changed}`);
	return fields.length > 0 ? fields.join(" ") : "actor=<unknown>";
}
/**
* Register a callback that scheduleGatewaySigusr1Restart checks before emitting SIGUSR1.
* The callback should return the number of pending items (0 = safe to restart).
*/
function setPreRestartDeferralCheck(fn) {
	preRestartCheck = fn;
}
/**
* Emit an authorized SIGUSR1 gateway restart, guarded against duplicate emissions.
* Returns true if SIGUSR1 was emitted, false if a restart was already emitted.
* Both scheduleGatewaySigusr1Restart and the config watcher should use this
* to ensure only one restart fires.
*/
function emitGatewayRestart() {
	if (hasUnconsumedRestartSignal()) {
		clearPendingScheduledRestart();
		return false;
	}
	clearPendingScheduledRestart();
	emittedRestartToken = ++restartCycleToken;
	authorizeGatewaySigusr1Restart();
	try {
		if (process.listenerCount("SIGUSR1") > 0) process.emit("SIGUSR1");
		else process.kill(process.pid, "SIGUSR1");
	} catch {
		emittedRestartToken = consumedRestartToken;
		return false;
	}
	lastRestartEmittedAt = Date.now();
	return true;
}
function resetSigusr1AuthorizationIfExpired(now = Date.now()) {
	if (sigusr1AuthorizedCount <= 0) return;
	if (now <= sigusr1AuthorizedUntil) return;
	sigusr1AuthorizedCount = 0;
	sigusr1AuthorizedUntil = 0;
}
function setGatewaySigusr1RestartPolicy(opts) {
	sigusr1ExternalAllowed = opts?.allowExternal === true;
}
function isGatewaySigusr1RestartExternallyAllowed() {
	return sigusr1ExternalAllowed;
}
function authorizeGatewaySigusr1Restart(delayMs = 0) {
	const delay = Math.max(0, Math.floor(delayMs));
	const expiresAt = Date.now() + delay + SIGUSR1_AUTH_GRACE_MS;
	sigusr1AuthorizedCount += 1;
	if (expiresAt > sigusr1AuthorizedUntil) sigusr1AuthorizedUntil = expiresAt;
}
function consumeGatewaySigusr1RestartAuthorization() {
	resetSigusr1AuthorizationIfExpired();
	if (sigusr1AuthorizedCount <= 0) return false;
	sigusr1AuthorizedCount -= 1;
	if (sigusr1AuthorizedCount <= 0) sigusr1AuthorizedUntil = 0;
	return true;
}
/**
* Mark the currently emitted SIGUSR1 restart cycle as consumed by the run loop.
* This explicitly advances the cycle state instead of resetting emit guards inside
* consumeGatewaySigusr1RestartAuthorization().
*/
function markGatewaySigusr1RestartHandled() {
	if (hasUnconsumedRestartSignal()) consumedRestartToken = emittedRestartToken;
}
/**
* Poll pending work until it drains (or times out), then emit one restart signal.
* Shared by both the direct RPC restart path and the config watcher path.
*/
function deferGatewayRestartUntilIdle(opts) {
	const pollMsRaw = opts.pollMs ?? DEFAULT_DEFERRAL_POLL_MS;
	const pollMs = Math.max(10, Math.floor(pollMsRaw));
	const maxWaitMsRaw = opts.maxWaitMs ?? DEFAULT_DEFERRAL_MAX_WAIT_MS;
	const maxWaitMs = Math.max(pollMs, Math.floor(maxWaitMsRaw));
	let pending;
	try {
		pending = opts.getPendingCount();
	} catch (err) {
		opts.hooks?.onCheckError?.(err);
		emitGatewayRestart();
		return;
	}
	if (pending <= 0) {
		opts.hooks?.onReady?.();
		emitGatewayRestart();
		return;
	}
	opts.hooks?.onDeferring?.(pending);
	const startedAt = Date.now();
	const poll = setInterval(() => {
		let current;
		try {
			current = opts.getPendingCount();
		} catch (err) {
			clearInterval(poll);
			opts.hooks?.onCheckError?.(err);
			emitGatewayRestart();
			return;
		}
		if (current <= 0) {
			clearInterval(poll);
			opts.hooks?.onReady?.();
			emitGatewayRestart();
			return;
		}
		const elapsedMs = Date.now() - startedAt;
		if (elapsedMs >= maxWaitMs) {
			clearInterval(poll);
			opts.hooks?.onTimeout?.(current, elapsedMs);
			emitGatewayRestart();
		}
	}, pollMs);
}
function formatSpawnDetail(result) {
	const clean = (value) => {
		return (typeof value === "string" ? value : value ? value.toString() : "").replace(/\s+/g, " ").trim();
	};
	if (result.error) {
		if (result.error instanceof Error) return result.error.message;
		if (typeof result.error === "string") return result.error;
		try {
			return JSON.stringify(result.error);
		} catch {
			return "unknown error";
		}
	}
	const stderr = clean(result.stderr);
	if (stderr) return stderr;
	const stdout = clean(result.stdout);
	if (stdout) return stdout;
	if (typeof result.status === "number") return `exit ${result.status}`;
	return "unknown error";
}
function normalizeSystemdUnit(raw, profile) {
	const unit = raw?.trim();
	if (!unit) return `${resolveGatewaySystemdServiceName(profile)}.service`;
	return unit.endsWith(".service") ? unit : `${unit}.service`;
}
function triggerOpenClawRestart() {
	if (process.env.VITEST || false) return {
		ok: true,
		method: "supervisor",
		detail: "test mode"
	};
	cleanStaleGatewayProcessesSync();
	const tried = [];
	if (process.platform === "linux") {
		const unit = normalizeSystemdUnit(process.env.OPENCLAW_SYSTEMD_UNIT, process.env.OPENCLAW_PROFILE);
		const userArgs = [
			"--user",
			"restart",
			unit
		];
		tried.push(`systemctl ${userArgs.join(" ")}`);
		const userRestart = spawnSync("systemctl", userArgs, {
			encoding: "utf8",
			timeout: SPAWN_TIMEOUT_MS
		});
		if (!userRestart.error && userRestart.status === 0) return {
			ok: true,
			method: "systemd",
			tried
		};
		const systemArgs = ["restart", unit];
		tried.push(`systemctl ${systemArgs.join(" ")}`);
		const systemRestart = spawnSync("systemctl", systemArgs, {
			encoding: "utf8",
			timeout: SPAWN_TIMEOUT_MS
		});
		if (!systemRestart.error && systemRestart.status === 0) return {
			ok: true,
			method: "systemd",
			tried
		};
		return {
			ok: false,
			method: "systemd",
			detail: [`user: ${formatSpawnDetail(userRestart)}`, `system: ${formatSpawnDetail(systemRestart)}`].join("; "),
			tried
		};
	}
	if (process.platform === "win32") return relaunchGatewayScheduledTask(process.env);
	if (process.platform !== "darwin") return {
		ok: false,
		method: "supervisor",
		detail: "unsupported platform restart"
	};
	const label = process.env.OPENCLAW_LAUNCHD_LABEL || resolveGatewayLaunchAgentLabel(process.env.OPENCLAW_PROFILE);
	const uid = typeof process.getuid === "function" ? process.getuid() : void 0;
	const domain = uid !== void 0 ? `gui/${uid}` : "gui/501";
	const target = `${domain}/${label}`;
	const args = [
		"kickstart",
		"-k",
		target
	];
	tried.push(`launchctl ${args.join(" ")}`);
	const res = spawnSync("launchctl", args, {
		encoding: "utf8",
		timeout: SPAWN_TIMEOUT_MS
	});
	if (!res.error && res.status === 0) return {
		ok: true,
		method: "launchctl",
		tried
	};
	const home = process.env.HOME?.trim() || os.homedir();
	const bootstrapArgs = [
		"bootstrap",
		domain,
		path.join(home, "Library", "LaunchAgents", `${label}.plist`)
	];
	tried.push(`launchctl ${bootstrapArgs.join(" ")}`);
	const boot = spawnSync("launchctl", bootstrapArgs, {
		encoding: "utf8",
		timeout: SPAWN_TIMEOUT_MS
	});
	if (boot.error || boot.status !== 0 && boot.status !== null) return {
		ok: false,
		method: "launchctl",
		detail: formatSpawnDetail(boot),
		tried
	};
	const retryArgs = [
		"kickstart",
		"-k",
		target
	];
	tried.push(`launchctl ${retryArgs.join(" ")}`);
	const retry = spawnSync("launchctl", retryArgs, {
		encoding: "utf8",
		timeout: SPAWN_TIMEOUT_MS
	});
	if (!retry.error && retry.status === 0) return {
		ok: true,
		method: "launchctl",
		tried
	};
	return {
		ok: false,
		method: "launchctl",
		detail: formatSpawnDetail(retry),
		tried
	};
}
function scheduleGatewaySigusr1Restart(opts) {
	const delayMsRaw = typeof opts?.delayMs === "number" && Number.isFinite(opts.delayMs) ? Math.floor(opts.delayMs) : 2e3;
	const delayMs = Math.min(Math.max(delayMsRaw, 0), 6e4);
	const reason = typeof opts?.reason === "string" && opts.reason.trim() ? opts.reason.trim().slice(0, 200) : void 0;
	const mode = process.listenerCount("SIGUSR1") > 0 ? "emit" : "signal";
	const nowMs = Date.now();
	const cooldownMsApplied = Math.max(0, lastRestartEmittedAt + RESTART_COOLDOWN_MS - nowMs);
	const requestedDueAt = nowMs + delayMs + cooldownMsApplied;
	if (hasUnconsumedRestartSignal()) {
		restartLog.warn(`restart request coalesced (already in-flight) reason=${reason ?? "unspecified"} ${formatRestartAudit(opts?.audit)}`);
		return {
			ok: true,
			pid: process.pid,
			signal: "SIGUSR1",
			delayMs: 0,
			reason,
			mode,
			coalesced: true,
			cooldownMsApplied
		};
	}
	if (pendingRestartTimer) {
		const remainingMs = Math.max(0, pendingRestartDueAt - nowMs);
		if (requestedDueAt < pendingRestartDueAt) {
			restartLog.warn(`restart request rescheduled earlier reason=${reason ?? "unspecified"} pendingReason=${pendingRestartReason ?? "unspecified"} oldDelayMs=${remainingMs} newDelayMs=${Math.max(0, requestedDueAt - nowMs)} ${formatRestartAudit(opts?.audit)}`);
			clearPendingScheduledRestart();
		} else {
			restartLog.warn(`restart request coalesced (already scheduled) reason=${reason ?? "unspecified"} pendingReason=${pendingRestartReason ?? "unspecified"} delayMs=${remainingMs} ${formatRestartAudit(opts?.audit)}`);
			return {
				ok: true,
				pid: process.pid,
				signal: "SIGUSR1",
				delayMs: remainingMs,
				reason,
				mode,
				coalesced: true,
				cooldownMsApplied
			};
		}
	}
	pendingRestartDueAt = requestedDueAt;
	pendingRestartReason = reason;
	pendingRestartTimer = setTimeout(() => {
		pendingRestartTimer = null;
		pendingRestartDueAt = 0;
		pendingRestartReason = void 0;
		const pendingCheck = preRestartCheck;
		if (!pendingCheck) {
			emitGatewayRestart();
			return;
		}
		deferGatewayRestartUntilIdle({ getPendingCount: pendingCheck });
	}, Math.max(0, requestedDueAt - nowMs));
	return {
		ok: true,
		pid: process.pid,
		signal: "SIGUSR1",
		delayMs: Math.max(0, requestedDueAt - nowMs),
		reason,
		mode,
		coalesced: false,
		cooldownMsApplied
	};
}
//#endregion
export { markGatewaySigusr1RestartHandled as a, setPreRestartDeferralCheck as c, findGatewayPidsOnPortSync as d, killProcessTree as f, isGatewaySigusr1RestartExternallyAllowed as i, triggerOpenClawRestart as l, deferGatewayRestartUntilIdle as n, scheduleGatewaySigusr1Restart as o, emitGatewayRestart as r, setGatewaySigusr1RestartPolicy as s, consumeGatewaySigusr1RestartAuthorization as t, cleanStaleGatewayProcessesSync as u };
