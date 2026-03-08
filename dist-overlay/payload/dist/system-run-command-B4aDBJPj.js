import { Er as extractShellWrapperCommand, Fr as POSIX_INLINE_COMMAND_FLAGS, Ir as POWERSHELL_INLINE_COMMAND_FLAGS, Lr as resolveInlineCommandMatch, Mr as unwrapDispatchWrappersForResolution, Or as hasEnvManipulationBeforeShellWrapper, Pr as unwrapKnownShellMultiplexerInvocation, jr as normalizeExecutableToken } from "./model-selection-Dnp6qsMS.js";
import { r as normalizeEnvVarKey } from "./host-env-security-CbFV1gAw.js";
import { r as mapAllowFromEntries } from "./channel-config-helpers-BnsIklFT.js";
import crypto from "node:crypto";
//#region src/infra/system-run-normalize.ts
function normalizeNonEmptyString(value) {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	return trimmed ? trimmed : null;
}
function normalizeStringArray(value) {
	return Array.isArray(value) ? mapAllowFromEntries(value) : [];
}
//#endregion
//#region src/infra/system-run-approval-binding.ts
function normalizeSystemRunApprovalFileOperand(value) {
	if (value === void 0) return;
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	const candidate = value;
	const argvIndex = typeof candidate.argvIndex === "number" && Number.isInteger(candidate.argvIndex) && candidate.argvIndex >= 0 ? candidate.argvIndex : null;
	const filePath = normalizeNonEmptyString(candidate.path);
	const sha256 = normalizeNonEmptyString(candidate.sha256);
	if (argvIndex === null || !filePath || !sha256) return null;
	return {
		argvIndex,
		path: filePath,
		sha256
	};
}
function normalizeSystemRunApprovalPlan(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	const candidate = value;
	const argv = normalizeStringArray(candidate.argv);
	if (argv.length === 0) return null;
	const mutableFileOperand = normalizeSystemRunApprovalFileOperand(candidate.mutableFileOperand);
	if (candidate.mutableFileOperand !== void 0 && mutableFileOperand === null) return null;
	return {
		argv,
		cwd: normalizeNonEmptyString(candidate.cwd),
		rawCommand: normalizeNonEmptyString(candidate.rawCommand),
		agentId: normalizeNonEmptyString(candidate.agentId),
		sessionKey: normalizeNonEmptyString(candidate.sessionKey),
		mutableFileOperand: mutableFileOperand ?? void 0
	};
}
function normalizeSystemRunEnvEntries(env) {
	if (!env || typeof env !== "object" || Array.isArray(env)) return [];
	const entries = [];
	for (const [rawKey, rawValue] of Object.entries(env)) {
		if (typeof rawValue !== "string") continue;
		const key = normalizeEnvVarKey(rawKey, { portable: true });
		if (!key) continue;
		entries.push([key, rawValue]);
	}
	entries.sort((a, b) => a[0].localeCompare(b[0]));
	return entries;
}
function hashSystemRunEnvEntries(entries) {
	if (entries.length === 0) return null;
	return crypto.createHash("sha256").update(JSON.stringify(entries)).digest("hex");
}
function buildSystemRunApprovalEnvBinding(env) {
	const entries = normalizeSystemRunEnvEntries(env);
	return {
		envHash: hashSystemRunEnvEntries(entries),
		envKeys: entries.map(([key]) => key)
	};
}
function buildSystemRunApprovalBinding(params) {
	const envBinding = buildSystemRunApprovalEnvBinding(params.env);
	return {
		binding: {
			argv: normalizeStringArray(params.argv),
			cwd: normalizeNonEmptyString(params.cwd),
			agentId: normalizeNonEmptyString(params.agentId),
			sessionKey: normalizeNonEmptyString(params.sessionKey),
			envHash: envBinding.envHash
		},
		envKeys: envBinding.envKeys
	};
}
function argvMatches(expectedArgv, actualArgv) {
	if (expectedArgv.length === 0 || expectedArgv.length !== actualArgv.length) return false;
	for (let i = 0; i < expectedArgv.length; i += 1) if (expectedArgv[i] !== actualArgv[i]) return false;
	return true;
}
const APPROVAL_REQUEST_MISMATCH_MESSAGE = "approval id does not match request";
function requestMismatch(details) {
	return {
		ok: false,
		code: "APPROVAL_REQUEST_MISMATCH",
		message: APPROVAL_REQUEST_MISMATCH_MESSAGE,
		details
	};
}
function matchSystemRunApprovalEnvHash(params) {
	if (!params.expectedEnvHash && !params.actualEnvHash) return { ok: true };
	if (!params.expectedEnvHash && params.actualEnvHash) return {
		ok: false,
		code: "APPROVAL_ENV_BINDING_MISSING",
		message: "approval id missing env binding for requested env overrides",
		details: { envKeys: params.actualEnvKeys }
	};
	if (params.expectedEnvHash !== params.actualEnvHash) return {
		ok: false,
		code: "APPROVAL_ENV_MISMATCH",
		message: "approval id env binding mismatch",
		details: {
			envKeys: params.actualEnvKeys,
			expectedEnvHash: params.expectedEnvHash,
			actualEnvHash: params.actualEnvHash
		}
	};
	return { ok: true };
}
function matchSystemRunApprovalBinding(params) {
	if (!argvMatches(params.expected.argv, params.actual.argv)) return requestMismatch();
	if (params.expected.cwd !== params.actual.cwd) return requestMismatch();
	if (params.expected.agentId !== params.actual.agentId) return requestMismatch();
	if (params.expected.sessionKey !== params.actual.sessionKey) return requestMismatch();
	return matchSystemRunApprovalEnvHash({
		expectedEnvHash: params.expected.envHash,
		actualEnvHash: params.actual.envHash,
		actualEnvKeys: params.actualEnvKeys
	});
}
function missingSystemRunApprovalBinding(params) {
	return requestMismatch({ envKeys: params.actualEnvKeys });
}
function toSystemRunApprovalMismatchError(params) {
	const details = {
		code: params.match.code,
		runId: params.runId
	};
	if (params.match.details) Object.assign(details, params.match.details);
	return {
		ok: false,
		message: params.match.message,
		details
	};
}
//#endregion
//#region src/infra/system-run-command.ts
function formatExecCommand(argv) {
	return argv.map((arg) => {
		if (arg.length === 0) return "\"\"";
		if (!/\s|"/.test(arg)) return arg;
		return `"${arg.replace(/"/g, "\\\"")}"`;
	}).join(" ");
}
const POSIX_OR_POWERSHELL_INLINE_WRAPPER_NAMES = new Set([
	"ash",
	"bash",
	"dash",
	"fish",
	"ksh",
	"powershell",
	"pwsh",
	"sh",
	"zsh"
]);
function unwrapShellWrapperArgv(argv) {
	const dispatchUnwrapped = unwrapDispatchWrappersForResolution(argv);
	const shellMultiplexer = unwrapKnownShellMultiplexerInvocation(dispatchUnwrapped);
	return shellMultiplexer.kind === "unwrapped" ? shellMultiplexer.argv : dispatchUnwrapped;
}
function hasTrailingPositionalArgvAfterInlineCommand(argv) {
	const wrapperArgv = unwrapShellWrapperArgv(argv);
	const token0 = wrapperArgv[0]?.trim();
	if (!token0) return false;
	const wrapper = normalizeExecutableToken(token0);
	if (!POSIX_OR_POWERSHELL_INLINE_WRAPPER_NAMES.has(wrapper)) return false;
	const inlineCommandIndex = wrapper === "powershell" || wrapper === "pwsh" ? resolveInlineCommandMatch(wrapperArgv, POWERSHELL_INLINE_COMMAND_FLAGS).valueTokenIndex : resolveInlineCommandMatch(wrapperArgv, POSIX_INLINE_COMMAND_FLAGS, { allowCombinedC: true }).valueTokenIndex;
	if (inlineCommandIndex === null) return false;
	return wrapperArgv.slice(inlineCommandIndex + 1).some((entry) => entry.trim().length > 0);
}
function validateSystemRunCommandConsistency(params) {
	const raw = typeof params.rawCommand === "string" && params.rawCommand.trim().length > 0 ? params.rawCommand.trim() : null;
	const shellWrapperResolution = extractShellWrapperCommand(params.argv);
	const shellCommand = shellWrapperResolution.command;
	const shellWrapperPositionalArgv = hasTrailingPositionalArgvAfterInlineCommand(params.argv);
	const envManipulationBeforeShellWrapper = shellWrapperResolution.isWrapper && hasEnvManipulationBeforeShellWrapper(params.argv);
	const inferred = shellCommand !== null && !(envManipulationBeforeShellWrapper || shellWrapperPositionalArgv) ? shellCommand.trim() : formatExecCommand(params.argv);
	if (raw && raw !== inferred) return {
		ok: false,
		message: "INVALID_REQUEST: rawCommand does not match command",
		details: {
			code: "RAW_COMMAND_MISMATCH",
			rawCommand: raw,
			inferred
		}
	};
	return {
		ok: true,
		shellCommand: shellCommand !== null ? envManipulationBeforeShellWrapper ? shellCommand : raw ?? shellCommand : null,
		cmdText: raw ?? inferred
	};
}
function resolveSystemRunCommand(params) {
	const raw = typeof params.rawCommand === "string" && params.rawCommand.trim().length > 0 ? params.rawCommand.trim() : null;
	const command = Array.isArray(params.command) ? params.command : [];
	if (command.length === 0) {
		if (raw) return {
			ok: false,
			message: "rawCommand requires params.command",
			details: { code: "MISSING_COMMAND" }
		};
		return {
			ok: true,
			argv: [],
			rawCommand: null,
			shellCommand: null,
			cmdText: ""
		};
	}
	const argv = command.map((v) => String(v));
	const validation = validateSystemRunCommandConsistency({
		argv,
		rawCommand: raw
	});
	if (!validation.ok) return {
		ok: false,
		message: validation.message,
		details: validation.details ?? { code: "RAW_COMMAND_MISMATCH" }
	};
	return {
		ok: true,
		argv,
		rawCommand: raw,
		shellCommand: validation.shellCommand,
		cmdText: validation.cmdText
	};
}
//#endregion
export { missingSystemRunApprovalBinding as a, normalizeNonEmptyString as c, matchSystemRunApprovalBinding as i, normalizeStringArray as l, resolveSystemRunCommand as n, normalizeSystemRunApprovalPlan as o, buildSystemRunApprovalBinding as r, toSystemRunApprovalMismatchError as s, formatExecCommand as t };
