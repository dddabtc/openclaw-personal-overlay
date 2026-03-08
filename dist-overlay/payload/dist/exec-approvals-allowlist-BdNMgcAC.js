import { _ as expandHomePrefix } from "./paths-BfR2LXbA.js";
import { Qt as validateSafeBinArgv, Yt as isTrustedSafeBinPath, an as DEFAULT_SAFE_BINS, cn as resolveCommandResolutionFromArgv, en as analyzeShellCommand, fn as extractShellWrapperInlineCommand, hn as isShellWrapperExecutable, in as splitCommandChain, mn as isDispatchWrapperExecutable, nn as isWindowsPlatform, on as matchAllowlist, sn as resolveAllowlistCandidatePath, vn as unwrapKnownDispatchWrapperInvocation, wn as SAFE_BIN_PROFILES, yn as unwrapKnownShellMultiplexerInvocation } from "./auth-profiles-B1GaQT5q.js";
import path from "node:path";
//#region src/infra/exec-approvals-allowlist.ts
function hasShellLineContinuation(command) {
	return /\\(?:\r\n|\n|\r)/.test(command);
}
function normalizeSafeBins(entries) {
	if (!Array.isArray(entries)) return /* @__PURE__ */ new Set();
	const normalized = entries.map((entry) => entry.trim().toLowerCase()).filter((entry) => entry.length > 0);
	return new Set(normalized);
}
function resolveSafeBins(entries) {
	if (entries === void 0) return normalizeSafeBins(DEFAULT_SAFE_BINS);
	return normalizeSafeBins(entries ?? []);
}
function isSafeBinUsage(params) {
	if (isWindowsPlatform(params.platform ?? process.platform)) return false;
	if (params.safeBins.size === 0) return false;
	const resolution = params.resolution;
	const execName = resolution?.executableName?.toLowerCase();
	if (!execName) return false;
	if (!params.safeBins.has(execName)) return false;
	if (!resolution?.resolvedPath) return false;
	if (!(params.isTrustedSafeBinPathFn ?? isTrustedSafeBinPath)({
		resolvedPath: resolution.resolvedPath,
		trustedDirs: params.trustedSafeBinDirs
	})) return false;
	const argv = params.argv.slice(1);
	const profile = (params.safeBinProfiles ?? SAFE_BIN_PROFILES)[execName];
	if (!profile) return false;
	return validateSafeBinArgv(argv, profile);
}
function isPathScopedExecutableToken(token) {
	return token.includes("/") || token.includes("\\");
}
function pickExecAllowlistContext(params) {
	return {
		allowlist: params.allowlist,
		safeBins: params.safeBins,
		safeBinProfiles: params.safeBinProfiles,
		cwd: params.cwd,
		platform: params.platform,
		trustedSafeBinDirs: params.trustedSafeBinDirs,
		skillBins: params.skillBins,
		autoAllowSkills: params.autoAllowSkills
	};
}
function normalizeSkillBinName(value) {
	const trimmed = value?.trim().toLowerCase();
	return trimmed && trimmed.length > 0 ? trimmed : null;
}
function normalizeSkillBinResolvedPath(value) {
	const trimmed = value?.trim();
	if (!trimmed) return null;
	const resolved = path.resolve(trimmed);
	if (process.platform === "win32") return resolved.replace(/\\/g, "/").toLowerCase();
	return resolved;
}
function buildSkillBinTrustIndex(entries) {
	const trustByName = /* @__PURE__ */ new Map();
	if (!entries || entries.length === 0) return trustByName;
	for (const entry of entries) {
		const name = normalizeSkillBinName(entry.name);
		const resolvedPath = normalizeSkillBinResolvedPath(entry.resolvedPath);
		if (!name || !resolvedPath) continue;
		const paths = trustByName.get(name) ?? /* @__PURE__ */ new Set();
		paths.add(resolvedPath);
		trustByName.set(name, paths);
	}
	return trustByName;
}
function isSkillAutoAllowedSegment(params) {
	if (!params.allowSkills) return false;
	const resolution = params.segment.resolution;
	if (!resolution?.resolvedPath) return false;
	const rawExecutable = resolution.rawExecutable?.trim() ?? "";
	if (!rawExecutable || isPathScopedExecutableToken(rawExecutable)) return false;
	const executableName = normalizeSkillBinName(resolution.executableName);
	const resolvedPath = normalizeSkillBinResolvedPath(resolution.resolvedPath);
	if (!executableName || !resolvedPath) return false;
	return Boolean(params.skillBinTrust.get(executableName)?.has(resolvedPath));
}
function evaluateSegments(segments, params) {
	const matches = [];
	const skillBinTrust = buildSkillBinTrustIndex(params.skillBins);
	const allowSkills = params.autoAllowSkills === true && skillBinTrust.size > 0;
	const segmentSatisfiedBy = [];
	return {
		satisfied: segments.every((segment) => {
			if (segment.resolution?.policyBlocked === true) {
				segmentSatisfiedBy.push(null);
				return false;
			}
			const effectiveArgv = segment.resolution?.effectiveArgv && segment.resolution.effectiveArgv.length > 0 ? segment.resolution.effectiveArgv : segment.argv;
			const allowlistSegment = effectiveArgv === segment.argv ? segment : {
				...segment,
				argv: effectiveArgv
			};
			const candidatePath = resolveAllowlistCandidatePath(segment.resolution, params.cwd);
			const candidateResolution = candidatePath && segment.resolution ? {
				...segment.resolution,
				resolvedPath: candidatePath
			} : segment.resolution;
			const executableMatch = matchAllowlist(params.allowlist, candidateResolution);
			const shellScriptCandidatePath = extractShellWrapperInlineCommand(allowlistSegment.argv) === null ? resolveShellWrapperScriptCandidatePath({
				segment: allowlistSegment,
				cwd: params.cwd
			}) : void 0;
			const shellScriptMatch = shellScriptCandidatePath ? matchAllowlist(params.allowlist, {
				rawExecutable: shellScriptCandidatePath,
				resolvedPath: shellScriptCandidatePath,
				executableName: path.basename(shellScriptCandidatePath)
			}) : null;
			const match = executableMatch ?? shellScriptMatch;
			if (match) matches.push(match);
			const safe = isSafeBinUsage({
				argv: effectiveArgv,
				resolution: segment.resolution,
				safeBins: params.safeBins,
				safeBinProfiles: params.safeBinProfiles,
				platform: params.platform,
				trustedSafeBinDirs: params.trustedSafeBinDirs
			});
			const skillAllow = isSkillAutoAllowedSegment({
				segment,
				allowSkills,
				skillBinTrust
			});
			const by = match ? "allowlist" : safe ? "safeBins" : skillAllow ? "skills" : null;
			segmentSatisfiedBy.push(by);
			return Boolean(by);
		}),
		matches,
		segmentSatisfiedBy
	};
}
function resolveAnalysisSegmentGroups(analysis) {
	if (analysis.chains) return analysis.chains;
	return [analysis.segments];
}
function evaluateExecAllowlist(params) {
	const allowlistMatches = [];
	const segmentSatisfiedBy = [];
	if (!params.analysis.ok || params.analysis.segments.length === 0) return {
		allowlistSatisfied: false,
		allowlistMatches,
		segmentSatisfiedBy
	};
	const allowlistContext = pickExecAllowlistContext(params);
	const hasChains = Boolean(params.analysis.chains);
	for (const group of resolveAnalysisSegmentGroups(params.analysis)) {
		const result = evaluateSegments(group, allowlistContext);
		if (!result.satisfied) {
			if (!hasChains) return {
				allowlistSatisfied: false,
				allowlistMatches: result.matches,
				segmentSatisfiedBy: result.segmentSatisfiedBy
			};
			return {
				allowlistSatisfied: false,
				allowlistMatches: [],
				segmentSatisfiedBy: []
			};
		}
		allowlistMatches.push(...result.matches);
		segmentSatisfiedBy.push(...result.segmentSatisfiedBy);
	}
	return {
		allowlistSatisfied: true,
		allowlistMatches,
		segmentSatisfiedBy
	};
}
function hasSegmentExecutableMatch(segment, predicate) {
	const candidates = [
		segment.resolution?.executableName,
		segment.resolution?.rawExecutable,
		segment.argv[0]
	];
	for (const candidate of candidates) {
		const trimmed = candidate?.trim();
		if (!trimmed) continue;
		if (predicate(trimmed)) return true;
	}
	return false;
}
function isShellWrapperSegment(segment) {
	return hasSegmentExecutableMatch(segment, isShellWrapperExecutable);
}
function isDispatchWrapperSegment(segment) {
	return hasSegmentExecutableMatch(segment, isDispatchWrapperExecutable);
}
const SHELL_WRAPPER_OPTIONS_WITH_VALUE = new Set([
	"-c",
	"--command",
	"-o",
	"-O",
	"+O",
	"--rcfile",
	"--init-file",
	"--startup-file"
]);
function resolveShellWrapperScriptCandidatePath(params) {
	if (!isShellWrapperSegment(params.segment)) return;
	const argv = params.segment.argv;
	if (!Array.isArray(argv) || argv.length < 2) return;
	let idx = 1;
	while (idx < argv.length) {
		const token = argv[idx]?.trim() ?? "";
		if (!token) {
			idx += 1;
			continue;
		}
		if (token === "--") {
			idx += 1;
			break;
		}
		if (token === "-c" || token === "--command") return;
		if (/^-[^-]*c[^-]*$/i.test(token)) return;
		if (token === "-s" || /^-[^-]*s[^-]*$/i.test(token)) return;
		if (SHELL_WRAPPER_OPTIONS_WITH_VALUE.has(token)) {
			idx += 2;
			continue;
		}
		if (token.startsWith("-") || token.startsWith("+")) {
			idx += 1;
			continue;
		}
		break;
	}
	const scriptToken = argv[idx]?.trim();
	if (!scriptToken) return;
	if (path.isAbsolute(scriptToken)) return scriptToken;
	const expanded = scriptToken.startsWith("~") ? expandHomePrefix(scriptToken) : scriptToken;
	const base = params.cwd && params.cwd.trim().length > 0 ? params.cwd : process.cwd();
	return path.resolve(base, expanded);
}
function collectAllowAlwaysPatterns(params) {
	if (params.depth >= 3) return;
	const recurseWithArgv = (argv) => {
		collectAllowAlwaysPatterns({
			segment: {
				raw: argv.join(" "),
				argv,
				resolution: resolveCommandResolutionFromArgv(argv, params.cwd, params.env)
			},
			cwd: params.cwd,
			env: params.env,
			platform: params.platform,
			depth: params.depth + 1,
			out: params.out
		});
	};
	if (isDispatchWrapperSegment(params.segment)) {
		const dispatchUnwrap = unwrapKnownDispatchWrapperInvocation(params.segment.argv);
		if (dispatchUnwrap.kind !== "unwrapped" || dispatchUnwrap.argv.length === 0) return;
		recurseWithArgv(dispatchUnwrap.argv);
		return;
	}
	const shellMultiplexerUnwrap = unwrapKnownShellMultiplexerInvocation(params.segment.argv);
	if (shellMultiplexerUnwrap.kind === "blocked") return;
	if (shellMultiplexerUnwrap.kind === "unwrapped") {
		recurseWithArgv(shellMultiplexerUnwrap.argv);
		return;
	}
	const candidatePath = resolveAllowlistCandidatePath(params.segment.resolution, params.cwd);
	if (!candidatePath) return;
	if (!isShellWrapperSegment(params.segment)) {
		params.out.add(candidatePath);
		return;
	}
	const inlineCommand = extractShellWrapperInlineCommand(params.segment.argv);
	if (!inlineCommand) {
		const scriptPath = resolveShellWrapperScriptCandidatePath({
			segment: params.segment,
			cwd: params.cwd
		});
		if (scriptPath) params.out.add(scriptPath);
		return;
	}
	const nested = analyzeShellCommand({
		command: inlineCommand,
		cwd: params.cwd,
		env: params.env,
		platform: params.platform
	});
	if (!nested.ok) return;
	for (const nestedSegment of nested.segments) collectAllowAlwaysPatterns({
		segment: nestedSegment,
		cwd: params.cwd,
		env: params.env,
		platform: params.platform,
		depth: params.depth + 1,
		out: params.out
	});
}
/**
* Derive persisted allowlist patterns for an "allow always" decision.
* When a command is wrapped in a shell (for example `zsh -lc "<cmd>"`),
* persist the inner executable(s) rather than the shell binary.
*/
function resolveAllowAlwaysPatterns(params) {
	const patterns = /* @__PURE__ */ new Set();
	for (const segment of params.segments) collectAllowAlwaysPatterns({
		segment,
		cwd: params.cwd,
		env: params.env,
		platform: params.platform,
		depth: 0,
		out: patterns
	});
	return Array.from(patterns);
}
/**
* Evaluates allowlist for shell commands (including &&, ||, ;) and returns analysis metadata.
*/
function evaluateShellAllowlist(params) {
	const allowlistContext = pickExecAllowlistContext(params);
	const analysisFailure = () => ({
		analysisOk: false,
		allowlistSatisfied: false,
		allowlistMatches: [],
		segments: [],
		segmentSatisfiedBy: []
	});
	if (hasShellLineContinuation(params.command)) return analysisFailure();
	const chainParts = isWindowsPlatform(params.platform) ? null : splitCommandChain(params.command);
	if (!chainParts) {
		const analysis = analyzeShellCommand({
			command: params.command,
			cwd: params.cwd,
			env: params.env,
			platform: params.platform
		});
		if (!analysis.ok) return analysisFailure();
		const evaluation = evaluateExecAllowlist({
			analysis,
			...allowlistContext
		});
		return {
			analysisOk: true,
			allowlistSatisfied: evaluation.allowlistSatisfied,
			allowlistMatches: evaluation.allowlistMatches,
			segments: analysis.segments,
			segmentSatisfiedBy: evaluation.segmentSatisfiedBy
		};
	}
	const allowlistMatches = [];
	const segments = [];
	const segmentSatisfiedBy = [];
	for (const part of chainParts) {
		const analysis = analyzeShellCommand({
			command: part,
			cwd: params.cwd,
			env: params.env,
			platform: params.platform
		});
		if (!analysis.ok) return analysisFailure();
		segments.push(...analysis.segments);
		const evaluation = evaluateExecAllowlist({
			analysis,
			...allowlistContext
		});
		allowlistMatches.push(...evaluation.allowlistMatches);
		segmentSatisfiedBy.push(...evaluation.segmentSatisfiedBy);
		if (!evaluation.allowlistSatisfied) return {
			analysisOk: true,
			allowlistSatisfied: false,
			allowlistMatches,
			segments,
			segmentSatisfiedBy
		};
	}
	return {
		analysisOk: true,
		allowlistSatisfied: true,
		allowlistMatches,
		segments,
		segmentSatisfiedBy
	};
}
//#endregion
export { resolveSafeBins as i, evaluateShellAllowlist as n, resolveAllowAlwaysPatterns as r, evaluateExecAllowlist as t };
