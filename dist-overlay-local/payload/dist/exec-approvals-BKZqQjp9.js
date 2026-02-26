import { fn as expandHomePrefix } from "./entry.js";
import { t as DEFAULT_AGENT_ID } from "./session-key-DjZ7Z1hW.js";
import { t as splitShellArgs } from "./shell-argv-DjSugwgF.js";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import net from "node:net";

//#region src/infra/jsonl-socket.ts
async function requestJsonlSocket(params) {
	const { socketPath, payload, timeoutMs, accept } = params;
	return await new Promise((resolve) => {
		const client = new net.Socket();
		let settled = false;
		let buffer = "";
		const finish = (value) => {
			if (settled) return;
			settled = true;
			try {
				client.destroy();
			} catch {}
			resolve(value);
		};
		const timer = setTimeout(() => finish(null), timeoutMs);
		client.on("error", () => finish(null));
		client.connect(socketPath, () => {
			client.write(`${payload}\n`);
		});
		client.on("data", (data) => {
			buffer += data.toString("utf8");
			let idx = buffer.indexOf("\n");
			while (idx !== -1) {
				const line = buffer.slice(0, idx).trim();
				buffer = buffer.slice(idx + 1);
				idx = buffer.indexOf("\n");
				if (!line) continue;
				try {
					const result = accept(JSON.parse(line));
					if (result === void 0) continue;
					clearTimeout(timer);
					finish(result);
					return;
				} catch {}
			}
		});
	});
}

//#endregion
//#region src/infra/exec-approvals-analysis.ts
const DEFAULT_SAFE_BINS = [
	"jq",
	"cut",
	"uniq",
	"head",
	"tail",
	"tr",
	"wc"
];
function isExecutableFile(filePath) {
	try {
		if (!fs.statSync(filePath).isFile()) return false;
		if (process.platform !== "win32") fs.accessSync(filePath, fs.constants.X_OK);
		return true;
	} catch {
		return false;
	}
}
function resolveExecutablePath(rawExecutable, cwd, env) {
	const expanded = rawExecutable.startsWith("~") ? expandHomePrefix(rawExecutable) : rawExecutable;
	if (expanded.includes("/") || expanded.includes("\\")) {
		if (path.isAbsolute(expanded)) return isExecutableFile(expanded) ? expanded : void 0;
		const base = cwd && cwd.trim() ? cwd.trim() : process.cwd();
		const candidate = path.resolve(base, expanded);
		return isExecutableFile(candidate) ? candidate : void 0;
	}
	const entries = (env?.PATH ?? env?.Path ?? process.env.PATH ?? process.env.Path ?? "").split(path.delimiter).filter(Boolean);
	const hasExtension = process.platform === "win32" && path.extname(expanded).length > 0;
	const extensions = process.platform === "win32" ? hasExtension ? [""] : (env?.PATHEXT ?? env?.Pathext ?? process.env.PATHEXT ?? process.env.Pathext ?? ".EXE;.CMD;.BAT;.COM").split(";").map((ext) => ext.toLowerCase()) : [""];
	for (const entry of entries) for (const ext of extensions) {
		const candidate = path.join(entry, expanded + ext);
		if (isExecutableFile(candidate)) return candidate;
	}
}
function resolveCommandResolutionFromArgv(argv, cwd, env) {
	const rawExecutable = argv[0]?.trim();
	if (!rawExecutable) return null;
	const resolvedPath = resolveExecutablePath(rawExecutable, cwd, env);
	return {
		rawExecutable,
		resolvedPath,
		executableName: resolvedPath ? path.basename(resolvedPath) : rawExecutable
	};
}
function normalizeMatchTarget(value) {
	if (process.platform === "win32") return value.replace(/^\\\\[?.]\\/, "").replace(/\\/g, "/").toLowerCase();
	return value.replace(/\\\\/g, "/").toLowerCase();
}
function tryRealpath(value) {
	try {
		return fs.realpathSync(value);
	} catch {
		return null;
	}
}
function globToRegExp(pattern) {
	let regex = "^";
	let i = 0;
	while (i < pattern.length) {
		const ch = pattern[i];
		if (ch === "*") {
			if (pattern[i + 1] === "*") {
				regex += ".*";
				i += 2;
				continue;
			}
			regex += "[^/]*";
			i += 1;
			continue;
		}
		if (ch === "?") {
			regex += ".";
			i += 1;
			continue;
		}
		regex += ch.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&");
		i += 1;
	}
	regex += "$";
	return new RegExp(regex, "i");
}
function matchesPattern(pattern, target) {
	const trimmed = pattern.trim();
	if (!trimmed) return false;
	const expanded = trimmed.startsWith("~") ? expandHomePrefix(trimmed) : trimmed;
	const hasWildcard = /[*?]/.test(expanded);
	let normalizedPattern = expanded;
	let normalizedTarget = target;
	if (process.platform === "win32" && !hasWildcard) {
		normalizedPattern = tryRealpath(expanded) ?? expanded;
		normalizedTarget = tryRealpath(target) ?? target;
	}
	normalizedPattern = normalizeMatchTarget(normalizedPattern);
	normalizedTarget = normalizeMatchTarget(normalizedTarget);
	return globToRegExp(normalizedPattern).test(normalizedTarget);
}
function resolveAllowlistCandidatePath(resolution, cwd) {
	if (!resolution) return;
	if (resolution.resolvedPath) return resolution.resolvedPath;
	const raw = resolution.rawExecutable?.trim();
	if (!raw) return;
	const expanded = raw.startsWith("~") ? expandHomePrefix(raw) : raw;
	if (!expanded.includes("/") && !expanded.includes("\\")) return;
	if (path.isAbsolute(expanded)) return expanded;
	const base = cwd && cwd.trim() ? cwd.trim() : process.cwd();
	return path.resolve(base, expanded);
}
function matchAllowlist(entries, resolution) {
	if (!entries.length || !resolution?.resolvedPath) return null;
	const resolvedPath = resolution.resolvedPath;
	for (const entry of entries) {
		const pattern = entry.pattern?.trim();
		if (!pattern) continue;
		if (!(pattern.includes("/") || pattern.includes("\\") || pattern.includes("~"))) continue;
		if (matchesPattern(pattern, resolvedPath)) return entry;
	}
	return null;
}
/**
* Tokenizes a single argv entry into a normalized option/positional model.
* Consumers can share this model to keep argv parsing behavior consistent.
*/
function parseExecArgvToken(raw) {
	if (!raw) return {
		kind: "empty",
		raw
	};
	if (raw === "--") return {
		kind: "terminator",
		raw
	};
	if (raw === "-") return {
		kind: "stdin",
		raw
	};
	if (!raw.startsWith("-")) return {
		kind: "positional",
		raw
	};
	if (raw.startsWith("--")) {
		const eqIndex = raw.indexOf("=");
		if (eqIndex > 0) return {
			kind: "option",
			raw,
			style: "long",
			flag: raw.slice(0, eqIndex),
			inlineValue: raw.slice(eqIndex + 1)
		};
		return {
			kind: "option",
			raw,
			style: "long",
			flag: raw
		};
	}
	const cluster = raw.slice(1);
	return {
		kind: "option",
		raw,
		style: "short-cluster",
		cluster,
		flags: cluster.split("").map((entry) => `-${entry}`)
	};
}
const DISALLOWED_PIPELINE_TOKENS = new Set([
	">",
	"<",
	"`",
	"\n",
	"\r",
	"(",
	")"
]);
const DOUBLE_QUOTE_ESCAPES = new Set([
	"\\",
	"\"",
	"$",
	"`",
	"\n",
	"\r"
]);
const WINDOWS_UNSUPPORTED_TOKENS = new Set([
	"&",
	"|",
	"<",
	">",
	"^",
	"(",
	")",
	"%",
	"!",
	"\n",
	"\r"
]);
function isDoubleQuoteEscape(next) {
	return Boolean(next && DOUBLE_QUOTE_ESCAPES.has(next));
}
function splitShellPipeline(command) {
	const parseHeredocDelimiter = (source, start) => {
		let i = start;
		while (i < source.length && (source[i] === " " || source[i] === "	")) i += 1;
		if (i >= source.length) return null;
		const first = source[i];
		if (first === "'" || first === "\"") {
			const quote = first;
			i += 1;
			let delimiter = "";
			while (i < source.length) {
				const ch = source[i];
				if (ch === "\n" || ch === "\r") return null;
				if (quote === "\"" && ch === "\\" && i + 1 < source.length) {
					delimiter += source[i + 1];
					i += 2;
					continue;
				}
				if (ch === quote) return {
					delimiter,
					end: i + 1,
					quoted: true
				};
				delimiter += ch;
				i += 1;
			}
			return null;
		}
		let delimiter = "";
		while (i < source.length) {
			const ch = source[i];
			if (/\s/.test(ch) || ch === "|" || ch === "&" || ch === ";" || ch === "<" || ch === ">") break;
			delimiter += ch;
			i += 1;
		}
		if (!delimiter) return null;
		return {
			delimiter,
			end: i,
			quoted: false
		};
	};
	const segments = [];
	let buf = "";
	let inSingle = false;
	let inDouble = false;
	let escaped = false;
	let emptySegment = false;
	const pendingHeredocs = [];
	let inHeredocBody = false;
	let heredocLine = "";
	const pushPart = () => {
		const trimmed = buf.trim();
		if (trimmed) segments.push(trimmed);
		buf = "";
	};
	const isEscapedInHeredocLine = (line, index) => {
		let slashes = 0;
		for (let i = index - 1; i >= 0 && line[i] === "\\"; i -= 1) slashes += 1;
		return slashes % 2 === 1;
	};
	const hasUnquotedHeredocExpansionToken = (line) => {
		for (let i = 0; i < line.length; i += 1) {
			const ch = line[i];
			if (ch === "`" && !isEscapedInHeredocLine(line, i)) return true;
			if (ch === "$" && !isEscapedInHeredocLine(line, i)) {
				const next = line[i + 1];
				if (next === "(" || next === "{") return true;
			}
		}
		return false;
	};
	for (let i = 0; i < command.length; i += 1) {
		const ch = command[i];
		const next = command[i + 1];
		if (inHeredocBody) {
			if (ch === "\n" || ch === "\r") {
				const current = pendingHeredocs[0];
				if (current) {
					if ((current.stripTabs ? heredocLine.replace(/^\t+/, "") : heredocLine) === current.delimiter) pendingHeredocs.shift();
					else if (!current.quoted && hasUnquotedHeredocExpansionToken(heredocLine)) return {
						ok: false,
						reason: "command substitution in unquoted heredoc",
						segments: []
					};
				}
				heredocLine = "";
				if (pendingHeredocs.length === 0) inHeredocBody = false;
				if (ch === "\r" && next === "\n") i += 1;
			} else heredocLine += ch;
			continue;
		}
		if (escaped) {
			buf += ch;
			escaped = false;
			emptySegment = false;
			continue;
		}
		if (!inSingle && !inDouble && ch === "\\") {
			escaped = true;
			buf += ch;
			emptySegment = false;
			continue;
		}
		if (inSingle) {
			if (ch === "'") inSingle = false;
			buf += ch;
			emptySegment = false;
			continue;
		}
		if (inDouble) {
			if (ch === "\\" && isDoubleQuoteEscape(next)) {
				buf += ch;
				buf += next;
				i += 1;
				emptySegment = false;
				continue;
			}
			if (ch === "$" && next === "(") return {
				ok: false,
				reason: "unsupported shell token: $()",
				segments: []
			};
			if (ch === "`") return {
				ok: false,
				reason: "unsupported shell token: `",
				segments: []
			};
			if (ch === "\n" || ch === "\r") return {
				ok: false,
				reason: "unsupported shell token: newline",
				segments: []
			};
			if (ch === "\"") inDouble = false;
			buf += ch;
			emptySegment = false;
			continue;
		}
		if (ch === "'") {
			inSingle = true;
			buf += ch;
			emptySegment = false;
			continue;
		}
		if (ch === "\"") {
			inDouble = true;
			buf += ch;
			emptySegment = false;
			continue;
		}
		if ((ch === "\n" || ch === "\r") && pendingHeredocs.length > 0) {
			inHeredocBody = true;
			heredocLine = "";
			if (ch === "\r" && next === "\n") i += 1;
			continue;
		}
		if (ch === "|" && next === "|") return {
			ok: false,
			reason: "unsupported shell token: ||",
			segments: []
		};
		if (ch === "|" && next === "&") return {
			ok: false,
			reason: "unsupported shell token: |&",
			segments: []
		};
		if (ch === "|") {
			emptySegment = true;
			pushPart();
			continue;
		}
		if (ch === "&" || ch === ";") return {
			ok: false,
			reason: `unsupported shell token: ${ch}`,
			segments: []
		};
		if (ch === "<" && next === "<") {
			buf += "<<";
			emptySegment = false;
			i += 1;
			let scanIndex = i + 1;
			let stripTabs = false;
			if (command[scanIndex] === "-") {
				stripTabs = true;
				buf += "-";
				scanIndex += 1;
			}
			const parsed = parseHeredocDelimiter(command, scanIndex);
			if (parsed) {
				pendingHeredocs.push({
					delimiter: parsed.delimiter,
					stripTabs,
					quoted: parsed.quoted
				});
				buf += command.slice(scanIndex, parsed.end);
				i = parsed.end - 1;
			}
			continue;
		}
		if (DISALLOWED_PIPELINE_TOKENS.has(ch)) return {
			ok: false,
			reason: `unsupported shell token: ${ch}`,
			segments: []
		};
		if (ch === "$" && next === "(") return {
			ok: false,
			reason: "unsupported shell token: $()",
			segments: []
		};
		buf += ch;
		emptySegment = false;
	}
	if (inHeredocBody && pendingHeredocs.length > 0) {
		const current = pendingHeredocs[0];
		if ((current.stripTabs ? heredocLine.replace(/^\t+/, "") : heredocLine) === current.delimiter) {
			pendingHeredocs.shift();
			if (pendingHeredocs.length === 0) inHeredocBody = false;
		}
	}
	if (pendingHeredocs.length > 0 || inHeredocBody) return {
		ok: false,
		reason: "unterminated heredoc",
		segments: []
	};
	if (escaped || inSingle || inDouble) return {
		ok: false,
		reason: "unterminated shell quote/escape",
		segments: []
	};
	pushPart();
	if (emptySegment || segments.length === 0) return {
		ok: false,
		reason: segments.length === 0 ? "empty command" : "empty pipeline segment",
		segments: []
	};
	return {
		ok: true,
		segments
	};
}
function findWindowsUnsupportedToken(command) {
	for (const ch of command) if (WINDOWS_UNSUPPORTED_TOKENS.has(ch)) {
		if (ch === "\n" || ch === "\r") return "newline";
		return ch;
	}
	return null;
}
function tokenizeWindowsSegment(segment) {
	const tokens = [];
	let buf = "";
	let inDouble = false;
	const pushToken = () => {
		if (buf.length > 0) {
			tokens.push(buf);
			buf = "";
		}
	};
	for (let i = 0; i < segment.length; i += 1) {
		const ch = segment[i];
		if (ch === "\"") {
			inDouble = !inDouble;
			continue;
		}
		if (!inDouble && /\s/.test(ch)) {
			pushToken();
			continue;
		}
		buf += ch;
	}
	if (inDouble) return null;
	pushToken();
	return tokens.length > 0 ? tokens : null;
}
function analyzeWindowsShellCommand(params) {
	const unsupported = findWindowsUnsupportedToken(params.command);
	if (unsupported) return {
		ok: false,
		reason: `unsupported windows shell token: ${unsupported}`,
		segments: []
	};
	const argv = tokenizeWindowsSegment(params.command);
	if (!argv || argv.length === 0) return {
		ok: false,
		reason: "unable to parse windows command",
		segments: []
	};
	return {
		ok: true,
		segments: [{
			raw: params.command,
			argv,
			resolution: resolveCommandResolutionFromArgv(argv, params.cwd, params.env)
		}]
	};
}
function isWindowsPlatform(platform) {
	return String(platform ?? "").trim().toLowerCase().startsWith("win");
}
function parseSegmentsFromParts(parts, cwd, env) {
	const segments = [];
	for (const raw of parts) {
		const argv = splitShellArgs(raw);
		if (!argv || argv.length === 0) return null;
		segments.push({
			raw,
			argv,
			resolution: resolveCommandResolutionFromArgv(argv, cwd, env)
		});
	}
	return segments;
}
/**
* Splits a command string by chain operators (&&, ||, ;) while preserving the operators.
* Returns null when no chain is present or when the chain is malformed.
*/
function splitCommandChainWithOperators(command) {
	const parts = [];
	let buf = "";
	let inSingle = false;
	let inDouble = false;
	let escaped = false;
	let foundChain = false;
	let invalidChain = false;
	const pushPart = (opToNext) => {
		const trimmed = buf.trim();
		buf = "";
		if (!trimmed) return false;
		parts.push({
			part: trimmed,
			opToNext
		});
		return true;
	};
	for (let i = 0; i < command.length; i += 1) {
		const ch = command[i];
		const next = command[i + 1];
		if (escaped) {
			buf += ch;
			escaped = false;
			continue;
		}
		if (!inSingle && !inDouble && ch === "\\") {
			escaped = true;
			buf += ch;
			continue;
		}
		if (inSingle) {
			if (ch === "'") inSingle = false;
			buf += ch;
			continue;
		}
		if (inDouble) {
			if (ch === "\\" && isDoubleQuoteEscape(next)) {
				buf += ch;
				buf += next;
				i += 1;
				continue;
			}
			if (ch === "\"") inDouble = false;
			buf += ch;
			continue;
		}
		if (ch === "'") {
			inSingle = true;
			buf += ch;
			continue;
		}
		if (ch === "\"") {
			inDouble = true;
			buf += ch;
			continue;
		}
		if (ch === "&" && next === "&") {
			if (!pushPart("&&")) invalidChain = true;
			i += 1;
			foundChain = true;
			continue;
		}
		if (ch === "|" && next === "|") {
			if (!pushPart("||")) invalidChain = true;
			i += 1;
			foundChain = true;
			continue;
		}
		if (ch === ";") {
			if (!pushPart(";")) invalidChain = true;
			foundChain = true;
			continue;
		}
		buf += ch;
	}
	if (!foundChain) return null;
	const trimmed = buf.trim();
	if (!trimmed) return null;
	parts.push({
		part: trimmed,
		opToNext: null
	});
	if (invalidChain || parts.length === 0) return null;
	return parts;
}
function shellEscapeSingleArg(value) {
	return `'${value.replace(/'/g, `'"'"'`)}'`;
}
/**
* Builds a shell command string that preserves pipes/chaining, but forces *arguments* to be
* literal (no globbing, no env-var expansion) by single-quoting every argv token.
*
* Used to make "safe bins" actually stdin-only even though execution happens via `shell -c`.
*/
function buildSafeShellCommand(params) {
	if (isWindowsPlatform(params.platform ?? null)) return {
		ok: false,
		reason: "unsupported platform"
	};
	const source = params.command.trim();
	if (!source) return {
		ok: false,
		reason: "empty command"
	};
	const chainParts = splitCommandChainWithOperators(source) ?? [{
		part: source,
		opToNext: null
	}];
	let out = "";
	for (let i = 0; i < chainParts.length; i += 1) {
		const part = chainParts[i];
		const pipelineSplit = splitShellPipeline(part.part);
		if (!pipelineSplit.ok) return {
			ok: false,
			reason: pipelineSplit.reason ?? "unable to parse pipeline"
		};
		const renderedSegments = [];
		for (const segmentRaw of pipelineSplit.segments) {
			const argv = splitShellArgs(segmentRaw);
			if (!argv || argv.length === 0) return {
				ok: false,
				reason: "unable to parse shell segment"
			};
			renderedSegments.push(argv.map((token) => shellEscapeSingleArg(token)).join(" "));
		}
		out += renderedSegments.join(" | ");
		if (part.opToNext) out += ` ${part.opToNext} `;
	}
	return {
		ok: true,
		command: out
	};
}
function renderQuotedArgv(argv) {
	return argv.map((token) => shellEscapeSingleArg(token)).join(" ");
}
/**
* Rebuilds a shell command and selectively single-quotes argv tokens for segments that
* must be treated as literal (safeBins hardening) while preserving the rest of the
* shell syntax (pipes + chaining).
*/
function buildSafeBinsShellCommand(params) {
	if (isWindowsPlatform(params.platform ?? null)) return {
		ok: false,
		reason: "unsupported platform"
	};
	if (params.segments.length !== params.segmentSatisfiedBy.length) return {
		ok: false,
		reason: "segment metadata mismatch"
	};
	const chainParts = splitCommandChainWithOperators(params.command.trim()) ?? [{
		part: params.command.trim(),
		opToNext: null
	}];
	let segIndex = 0;
	let out = "";
	for (const part of chainParts) {
		const pipelineSplit = splitShellPipeline(part.part);
		if (!pipelineSplit.ok) return {
			ok: false,
			reason: pipelineSplit.reason ?? "unable to parse pipeline"
		};
		const rendered = [];
		for (const raw of pipelineSplit.segments) {
			const seg = params.segments[segIndex];
			const by = params.segmentSatisfiedBy[segIndex];
			if (!seg || by === void 0) return {
				ok: false,
				reason: "segment mapping failed"
			};
			const needsLiteral = by === "safeBins";
			rendered.push(needsLiteral ? renderQuotedArgv(seg.argv) : raw.trim());
			segIndex += 1;
		}
		out += rendered.join(" | ");
		if (part.opToNext) out += ` ${part.opToNext} `;
	}
	if (segIndex !== params.segments.length) return {
		ok: false,
		reason: "segment count mismatch"
	};
	return {
		ok: true,
		command: out
	};
}
/**
* Splits a command string by chain operators (&&, ||, ;) while respecting quotes.
* Returns null when no chain is present or when the chain is malformed.
*/
function splitCommandChain(command) {
	const parts = splitCommandChainWithOperators(command);
	if (!parts) return null;
	return parts.map((p) => p.part);
}
function analyzeShellCommand(params) {
	if (isWindowsPlatform(params.platform)) return analyzeWindowsShellCommand(params);
	const chainParts = splitCommandChain(params.command);
	if (chainParts) {
		const chains = [];
		const allSegments = [];
		for (const part of chainParts) {
			const pipelineSplit = splitShellPipeline(part);
			if (!pipelineSplit.ok) return {
				ok: false,
				reason: pipelineSplit.reason,
				segments: []
			};
			const segments = parseSegmentsFromParts(pipelineSplit.segments, params.cwd, params.env);
			if (!segments) return {
				ok: false,
				reason: "unable to parse shell segment",
				segments: []
			};
			chains.push(segments);
			allSegments.push(...segments);
		}
		return {
			ok: true,
			segments: allSegments,
			chains
		};
	}
	const split = splitShellPipeline(params.command);
	if (!split.ok) return {
		ok: false,
		reason: split.reason,
		segments: []
	};
	const segments = parseSegmentsFromParts(split.segments, params.cwd, params.env);
	if (!segments) return {
		ok: false,
		reason: "unable to parse shell segment",
		segments: []
	};
	return {
		ok: true,
		segments
	};
}
function analyzeArgvCommand(params) {
	const argv = params.argv.filter((entry) => entry.trim().length > 0);
	if (argv.length === 0) return {
		ok: false,
		reason: "empty argv",
		segments: []
	};
	return {
		ok: true,
		segments: [{
			raw: argv.join(" "),
			argv,
			resolution: resolveCommandResolutionFromArgv(argv, params.cwd, params.env)
		}]
	};
}

//#endregion
//#region src/infra/exec-safe-bin-policy.ts
function isPathLikeToken(value) {
	const trimmed = value.trim();
	if (!trimmed) return false;
	if (trimmed === "-") return false;
	if (trimmed.startsWith("./") || trimmed.startsWith("../") || trimmed.startsWith("~")) return true;
	if (trimmed.startsWith("/")) return true;
	return /^[A-Za-z]:[\\/]/.test(trimmed);
}
function hasGlobToken(value) {
	return /[*?[\]]/.test(value);
}
const NO_FLAGS = /* @__PURE__ */ new Set();
const toFlagSet = (flags) => {
	if (!flags || flags.length === 0) return NO_FLAGS;
	return new Set(flags);
};
function compileSafeBinProfile(fixture) {
	return {
		minPositional: fixture.minPositional,
		maxPositional: fixture.maxPositional,
		valueFlags: toFlagSet(fixture.valueFlags),
		blockedFlags: toFlagSet(fixture.blockedFlags)
	};
}
function compileSafeBinProfiles(fixtures) {
	return Object.fromEntries(Object.entries(fixtures).map(([name, fixture]) => [name, compileSafeBinProfile(fixture)]));
}
const SAFE_BIN_GENERIC_PROFILE_FIXTURE = {};
const SAFE_BIN_PROFILE_FIXTURES = {
	jq: {
		maxPositional: 1,
		valueFlags: [
			"--arg",
			"--argjson",
			"--argstr",
			"--argfile",
			"--rawfile",
			"--slurpfile",
			"--from-file",
			"--library-path",
			"-L",
			"-f"
		],
		blockedFlags: [
			"--argfile",
			"--rawfile",
			"--slurpfile",
			"--from-file",
			"--library-path",
			"-L",
			"-f"
		]
	},
	grep: {
		maxPositional: 0,
		valueFlags: [
			"--regexp",
			"--file",
			"--max-count",
			"--after-context",
			"--before-context",
			"--context",
			"--devices",
			"--directories",
			"--binary-files",
			"--exclude",
			"--exclude-from",
			"--include",
			"--label",
			"-e",
			"-f",
			"-m",
			"-A",
			"-B",
			"-C",
			"-D",
			"-d"
		],
		blockedFlags: [
			"--file",
			"--exclude-from",
			"--dereference-recursive",
			"--directories",
			"--recursive",
			"-f",
			"-d",
			"-r",
			"-R"
		]
	},
	cut: {
		maxPositional: 0,
		valueFlags: [
			"--bytes",
			"--characters",
			"--fields",
			"--delimiter",
			"--output-delimiter",
			"-b",
			"-c",
			"-f",
			"-d"
		]
	},
	sort: {
		maxPositional: 0,
		valueFlags: [
			"--key",
			"--field-separator",
			"--buffer-size",
			"--temporary-directory",
			"--compress-program",
			"--parallel",
			"--batch-size",
			"--random-source",
			"--files0-from",
			"--output",
			"-k",
			"-t",
			"-S",
			"-T",
			"-o"
		],
		blockedFlags: [
			"--files0-from",
			"--output",
			"-o"
		]
	},
	uniq: {
		maxPositional: 0,
		valueFlags: [
			"--skip-fields",
			"--skip-chars",
			"--check-chars",
			"--group",
			"-f",
			"-s",
			"-w"
		]
	},
	head: {
		maxPositional: 0,
		valueFlags: [
			"--lines",
			"--bytes",
			"-n",
			"-c"
		]
	},
	tail: {
		maxPositional: 0,
		valueFlags: [
			"--lines",
			"--bytes",
			"--sleep-interval",
			"--max-unchanged-stats",
			"--pid",
			"-n",
			"-c"
		]
	},
	tr: {
		minPositional: 1,
		maxPositional: 2
	},
	wc: {
		maxPositional: 0,
		valueFlags: ["--files0-from"],
		blockedFlags: ["--files0-from"]
	}
};
const SAFE_BIN_GENERIC_PROFILE = compileSafeBinProfile(SAFE_BIN_GENERIC_PROFILE_FIXTURE);
const SAFE_BIN_PROFILES = compileSafeBinProfiles(SAFE_BIN_PROFILE_FIXTURES);
function isSafeLiteralToken(value) {
	if (!value || value === "-") return true;
	return !hasGlobToken(value) && !isPathLikeToken(value);
}
function isInvalidValueToken(value) {
	return !value || !isSafeLiteralToken(value);
}
function consumeLongOptionToken(args, index, flag, inlineValue, valueFlags, blockedFlags) {
	if (blockedFlags.has(flag)) return -1;
	if (inlineValue !== void 0) return isSafeLiteralToken(inlineValue) ? index + 1 : -1;
	if (!valueFlags.has(flag)) return index + 1;
	return isInvalidValueToken(args[index + 1]) ? -1 : index + 2;
}
function consumeShortOptionClusterToken(args, index, raw, cluster, flags, valueFlags, blockedFlags) {
	for (let j = 0; j < flags.length; j += 1) {
		const flag = flags[j];
		if (blockedFlags.has(flag)) return -1;
		if (!valueFlags.has(flag)) continue;
		const inlineValue = cluster.slice(j + 1);
		if (inlineValue) return isSafeLiteralToken(inlineValue) ? index + 1 : -1;
		return isInvalidValueToken(args[index + 1]) ? -1 : index + 2;
	}
	return hasGlobToken(raw) ? -1 : index + 1;
}
function consumePositionalToken(token, positional) {
	if (!isSafeLiteralToken(token)) return false;
	positional.push(token);
	return true;
}
function validatePositionalCount(positional, profile) {
	const minPositional = profile.minPositional ?? 0;
	if (positional.length < minPositional) return false;
	return typeof profile.maxPositional !== "number" || positional.length <= profile.maxPositional;
}
function validateSafeBinArgv(args, profile) {
	const valueFlags = profile.valueFlags ?? NO_FLAGS;
	const blockedFlags = profile.blockedFlags ?? NO_FLAGS;
	const positional = [];
	let i = 0;
	while (i < args.length) {
		const token = parseExecArgvToken(args[i] ?? "");
		if (token.kind === "empty" || token.kind === "stdin") {
			i += 1;
			continue;
		}
		if (token.kind === "terminator") {
			for (let j = i + 1; j < args.length; j += 1) {
				const rest = args[j];
				if (!rest || rest === "-") continue;
				if (!consumePositionalToken(rest, positional)) return false;
			}
			break;
		}
		if (token.kind === "positional") {
			if (!consumePositionalToken(token.raw, positional)) return false;
			i += 1;
			continue;
		}
		if (token.style === "long") {
			const nextIndex = consumeLongOptionToken(args, i, token.flag, token.inlineValue, valueFlags, blockedFlags);
			if (nextIndex < 0) return false;
			i = nextIndex;
			continue;
		}
		const nextIndex = consumeShortOptionClusterToken(args, i, token.raw, token.cluster, token.flags, valueFlags, blockedFlags);
		if (nextIndex < 0) return false;
		i = nextIndex;
	}
	return validatePositionalCount(positional, profile);
}

//#endregion
//#region src/infra/exec-safe-bin-trust.ts
const DEFAULT_SAFE_BIN_TRUSTED_DIRS = [
	"/bin",
	"/usr/bin",
	"/usr/local/bin",
	"/opt/homebrew/bin",
	"/opt/local/bin",
	"/snap/bin",
	"/run/current-system/sw/bin"
];
let trustedSafeBinCache = null;
const STARTUP_PATH_ENV = process.env.PATH ?? process.env.Path ?? "";
function normalizeTrustedDir(value) {
	const trimmed = value.trim();
	if (!trimmed) return null;
	return path.resolve(trimmed);
}
function buildTrustedSafeBinCacheKey(pathEnv, delimiter) {
	return `${delimiter}\u0000${pathEnv}`;
}
function buildTrustedSafeBinDirs(params = {}) {
	const delimiter = params.delimiter ?? path.delimiter;
	const pathEnv = params.pathEnv ?? "";
	const baseDirs = params.baseDirs ?? DEFAULT_SAFE_BIN_TRUSTED_DIRS;
	const trusted = /* @__PURE__ */ new Set();
	for (const entry of baseDirs) {
		const normalized = normalizeTrustedDir(entry);
		if (normalized) trusted.add(normalized);
	}
	const pathEntries = pathEnv.split(delimiter).map((entry) => normalizeTrustedDir(entry)).filter((entry) => Boolean(entry));
	for (const entry of pathEntries) trusted.add(entry);
	return trusted;
}
function getTrustedSafeBinDirs(params = {}) {
	const delimiter = params.delimiter ?? path.delimiter;
	const pathEnv = params.pathEnv ?? STARTUP_PATH_ENV;
	const key = buildTrustedSafeBinCacheKey(pathEnv, delimiter);
	if (!params.refresh && trustedSafeBinCache?.key === key) return trustedSafeBinCache.dirs;
	const dirs = buildTrustedSafeBinDirs({
		pathEnv,
		delimiter
	});
	trustedSafeBinCache = {
		key,
		dirs
	};
	return dirs;
}
function isTrustedSafeBinPath(params) {
	const trustedDirs = params.trustedDirs ?? getTrustedSafeBinDirs({
		pathEnv: params.pathEnv,
		delimiter: params.delimiter
	});
	const resolvedDir = path.dirname(path.resolve(params.resolvedPath));
	return trustedDirs.has(resolvedDir);
}

//#endregion
//#region src/infra/exec-approvals-allowlist.ts
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
	const safeBinProfiles = params.safeBinProfiles ?? SAFE_BIN_PROFILES;
	const genericSafeBinProfile = params.safeBinGenericProfile ?? SAFE_BIN_GENERIC_PROFILE;
	return validateSafeBinArgv(argv, safeBinProfiles[execName] ?? genericSafeBinProfile);
}
function evaluateSegments(segments, params) {
	const matches = [];
	const allowSkills = params.autoAllowSkills === true && (params.skillBins?.size ?? 0) > 0;
	const segmentSatisfiedBy = [];
	return {
		satisfied: segments.every((segment) => {
			const candidatePath = resolveAllowlistCandidatePath(segment.resolution, params.cwd);
			const candidateResolution = candidatePath && segment.resolution ? {
				...segment.resolution,
				resolvedPath: candidatePath
			} : segment.resolution;
			const match = matchAllowlist(params.allowlist, candidateResolution);
			if (match) matches.push(match);
			const safe = isSafeBinUsage({
				argv: segment.argv,
				resolution: segment.resolution,
				safeBins: params.safeBins,
				platform: params.platform,
				trustedSafeBinDirs: params.trustedSafeBinDirs
			});
			const skillAllow = allowSkills && segment.resolution?.executableName ? params.skillBins?.has(segment.resolution.executableName) : false;
			const by = match ? "allowlist" : safe ? "safeBins" : skillAllow ? "skills" : null;
			segmentSatisfiedBy.push(by);
			return Boolean(by);
		}),
		matches,
		segmentSatisfiedBy
	};
}
function evaluateExecAllowlist(params) {
	const allowlistMatches = [];
	const segmentSatisfiedBy = [];
	if (!params.analysis.ok || params.analysis.segments.length === 0) return {
		allowlistSatisfied: false,
		allowlistMatches,
		segmentSatisfiedBy
	};
	if (params.analysis.chains) {
		for (const chainSegments of params.analysis.chains) {
			const result = evaluateSegments(chainSegments, {
				allowlist: params.allowlist,
				safeBins: params.safeBins,
				cwd: params.cwd,
				platform: params.platform,
				trustedSafeBinDirs: params.trustedSafeBinDirs,
				skillBins: params.skillBins,
				autoAllowSkills: params.autoAllowSkills
			});
			if (!result.satisfied) return {
				allowlistSatisfied: false,
				allowlistMatches: [],
				segmentSatisfiedBy: []
			};
			allowlistMatches.push(...result.matches);
			segmentSatisfiedBy.push(...result.segmentSatisfiedBy);
		}
		return {
			allowlistSatisfied: true,
			allowlistMatches,
			segmentSatisfiedBy
		};
	}
	const result = evaluateSegments(params.analysis.segments, {
		allowlist: params.allowlist,
		safeBins: params.safeBins,
		cwd: params.cwd,
		platform: params.platform,
		trustedSafeBinDirs: params.trustedSafeBinDirs,
		skillBins: params.skillBins,
		autoAllowSkills: params.autoAllowSkills
	});
	return {
		allowlistSatisfied: result.satisfied,
		allowlistMatches: result.matches,
		segmentSatisfiedBy: result.segmentSatisfiedBy
	};
}
/**
* Evaluates allowlist for shell commands (including &&, ||, ;) and returns analysis metadata.
*/
function evaluateShellAllowlist(params) {
	const analysisFailure = () => ({
		analysisOk: false,
		allowlistSatisfied: false,
		allowlistMatches: [],
		segments: [],
		segmentSatisfiedBy: []
	});
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
			allowlist: params.allowlist,
			safeBins: params.safeBins,
			cwd: params.cwd,
			platform: params.platform,
			trustedSafeBinDirs: params.trustedSafeBinDirs,
			skillBins: params.skillBins,
			autoAllowSkills: params.autoAllowSkills
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
			allowlist: params.allowlist,
			safeBins: params.safeBins,
			cwd: params.cwd,
			platform: params.platform,
			trustedSafeBinDirs: params.trustedSafeBinDirs,
			skillBins: params.skillBins,
			autoAllowSkills: params.autoAllowSkills
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
//#region src/infra/exec-approvals.ts
const DEFAULT_EXEC_APPROVAL_TIMEOUT_MS = 12e4;
const DEFAULT_SECURITY = "deny";
const DEFAULT_ASK = "on-miss";
const DEFAULT_ASK_FALLBACK = "deny";
const DEFAULT_AUTO_ALLOW_SKILLS = false;
const DEFAULT_SOCKET = "~/.openclaw/exec-approvals.sock";
const DEFAULT_FILE = "~/.openclaw/exec-approvals.json";
function hashExecApprovalsRaw(raw) {
	return crypto.createHash("sha256").update(raw ?? "").digest("hex");
}
function resolveExecApprovalsPath() {
	return expandHomePrefix(DEFAULT_FILE);
}
function resolveExecApprovalsSocketPath() {
	return expandHomePrefix(DEFAULT_SOCKET);
}
function normalizeAllowlistPattern(value) {
	const trimmed = value?.trim() ?? "";
	return trimmed ? trimmed.toLowerCase() : null;
}
function mergeLegacyAgent(current, legacy) {
	const allowlist = [];
	const seen = /* @__PURE__ */ new Set();
	const pushEntry = (entry) => {
		const key = normalizeAllowlistPattern(entry.pattern);
		if (!key || seen.has(key)) return;
		seen.add(key);
		allowlist.push(entry);
	};
	for (const entry of current.allowlist ?? []) pushEntry(entry);
	for (const entry of legacy.allowlist ?? []) pushEntry(entry);
	return {
		security: current.security ?? legacy.security,
		ask: current.ask ?? legacy.ask,
		askFallback: current.askFallback ?? legacy.askFallback,
		autoAllowSkills: current.autoAllowSkills ?? legacy.autoAllowSkills,
		allowlist: allowlist.length > 0 ? allowlist : void 0
	};
}
function ensureDir(filePath) {
	const dir = path.dirname(filePath);
	fs.mkdirSync(dir, { recursive: true });
}
function coerceAllowlistEntries(allowlist) {
	if (!Array.isArray(allowlist) || allowlist.length === 0) return Array.isArray(allowlist) ? allowlist : void 0;
	let changed = false;
	const result = [];
	for (const item of allowlist) if (typeof item === "string") {
		const trimmed = item.trim();
		if (trimmed) {
			result.push({ pattern: trimmed });
			changed = true;
		} else changed = true;
	} else if (item && typeof item === "object" && !Array.isArray(item)) {
		const pattern = item.pattern;
		if (typeof pattern === "string" && pattern.trim().length > 0) result.push(item);
		else changed = true;
	} else changed = true;
	return changed ? result.length > 0 ? result : void 0 : allowlist;
}
function ensureAllowlistIds(allowlist) {
	if (!Array.isArray(allowlist) || allowlist.length === 0) return allowlist;
	let changed = false;
	const next = allowlist.map((entry) => {
		if (entry.id) return entry;
		changed = true;
		return {
			...entry,
			id: crypto.randomUUID()
		};
	});
	return changed ? next : allowlist;
}
function normalizeExecApprovals(file) {
	const socketPath = file.socket?.path?.trim();
	const token = file.socket?.token?.trim();
	const agents = { ...file.agents };
	const legacyDefault = agents.default;
	if (legacyDefault) {
		const main = agents[DEFAULT_AGENT_ID];
		agents[DEFAULT_AGENT_ID] = main ? mergeLegacyAgent(main, legacyDefault) : legacyDefault;
		delete agents.default;
	}
	for (const [key, agent] of Object.entries(agents)) {
		const allowlist = ensureAllowlistIds(coerceAllowlistEntries(agent.allowlist));
		if (allowlist !== agent.allowlist) agents[key] = {
			...agent,
			allowlist
		};
	}
	return {
		version: 1,
		socket: {
			path: socketPath && socketPath.length > 0 ? socketPath : void 0,
			token: token && token.length > 0 ? token : void 0
		},
		defaults: {
			security: file.defaults?.security,
			ask: file.defaults?.ask,
			askFallback: file.defaults?.askFallback,
			autoAllowSkills: file.defaults?.autoAllowSkills
		},
		agents
	};
}
function mergeExecApprovalsSocketDefaults(params) {
	const currentSocketPath = params.current?.socket?.path?.trim();
	const currentToken = params.current?.socket?.token?.trim();
	const socketPath = params.normalized.socket?.path?.trim() ?? currentSocketPath ?? resolveExecApprovalsSocketPath();
	const token = params.normalized.socket?.token?.trim() ?? currentToken ?? "";
	return {
		...params.normalized,
		socket: {
			path: socketPath,
			token
		}
	};
}
function generateToken() {
	return crypto.randomBytes(24).toString("base64url");
}
function readExecApprovalsSnapshot() {
	const filePath = resolveExecApprovalsPath();
	if (!fs.existsSync(filePath)) return {
		path: filePath,
		exists: false,
		raw: null,
		file: normalizeExecApprovals({
			version: 1,
			agents: {}
		}),
		hash: hashExecApprovalsRaw(null)
	};
	const raw = fs.readFileSync(filePath, "utf8");
	let parsed = null;
	try {
		parsed = JSON.parse(raw);
	} catch {
		parsed = null;
	}
	return {
		path: filePath,
		exists: true,
		raw,
		file: parsed?.version === 1 ? normalizeExecApprovals(parsed) : normalizeExecApprovals({
			version: 1,
			agents: {}
		}),
		hash: hashExecApprovalsRaw(raw)
	};
}
function loadExecApprovals() {
	const filePath = resolveExecApprovalsPath();
	try {
		if (!fs.existsSync(filePath)) return normalizeExecApprovals({
			version: 1,
			agents: {}
		});
		const raw = fs.readFileSync(filePath, "utf8");
		const parsed = JSON.parse(raw);
		if (parsed?.version !== 1) return normalizeExecApprovals({
			version: 1,
			agents: {}
		});
		return normalizeExecApprovals(parsed);
	} catch {
		return normalizeExecApprovals({
			version: 1,
			agents: {}
		});
	}
}
function saveExecApprovals(file) {
	const filePath = resolveExecApprovalsPath();
	ensureDir(filePath);
	fs.writeFileSync(filePath, `${JSON.stringify(file, null, 2)}\n`, { mode: 384 });
	try {
		fs.chmodSync(filePath, 384);
	} catch {}
}
function ensureExecApprovals() {
	const next = normalizeExecApprovals(loadExecApprovals());
	const socketPath = next.socket?.path?.trim();
	const token = next.socket?.token?.trim();
	const updated = {
		...next,
		socket: {
			path: socketPath && socketPath.length > 0 ? socketPath : resolveExecApprovalsSocketPath(),
			token: token && token.length > 0 ? token : generateToken()
		}
	};
	saveExecApprovals(updated);
	return updated;
}
function normalizeSecurity(value, fallback) {
	if (value === "allowlist" || value === "full" || value === "deny") return value;
	return fallback;
}
function normalizeAsk(value, fallback) {
	if (value === "always" || value === "off" || value === "on-miss") return value;
	return fallback;
}
function resolveExecApprovals(agentId, overrides) {
	const file = ensureExecApprovals();
	return resolveExecApprovalsFromFile({
		file,
		agentId,
		overrides,
		path: resolveExecApprovalsPath(),
		socketPath: expandHomePrefix(file.socket?.path ?? resolveExecApprovalsSocketPath()),
		token: file.socket?.token ?? ""
	});
}
function resolveExecApprovalsFromFile(params) {
	const file = normalizeExecApprovals(params.file);
	const defaults = file.defaults ?? {};
	const agentKey = params.agentId ?? DEFAULT_AGENT_ID;
	const agent = file.agents?.[agentKey] ?? {};
	const wildcard = file.agents?.["*"] ?? {};
	const fallbackSecurity = params.overrides?.security ?? DEFAULT_SECURITY;
	const fallbackAsk = params.overrides?.ask ?? DEFAULT_ASK;
	const fallbackAskFallback = params.overrides?.askFallback ?? DEFAULT_ASK_FALLBACK;
	const fallbackAutoAllowSkills = params.overrides?.autoAllowSkills ?? DEFAULT_AUTO_ALLOW_SKILLS;
	const resolvedDefaults = {
		security: normalizeSecurity(defaults.security, fallbackSecurity),
		ask: normalizeAsk(defaults.ask, fallbackAsk),
		askFallback: normalizeSecurity(defaults.askFallback ?? fallbackAskFallback, fallbackAskFallback),
		autoAllowSkills: Boolean(defaults.autoAllowSkills ?? fallbackAutoAllowSkills)
	};
	const resolvedAgent = {
		security: normalizeSecurity(agent.security ?? wildcard.security ?? resolvedDefaults.security, resolvedDefaults.security),
		ask: normalizeAsk(agent.ask ?? wildcard.ask ?? resolvedDefaults.ask, resolvedDefaults.ask),
		askFallback: normalizeSecurity(agent.askFallback ?? wildcard.askFallback ?? resolvedDefaults.askFallback, resolvedDefaults.askFallback),
		autoAllowSkills: Boolean(agent.autoAllowSkills ?? wildcard.autoAllowSkills ?? resolvedDefaults.autoAllowSkills)
	};
	const allowlist = [...Array.isArray(wildcard.allowlist) ? wildcard.allowlist : [], ...Array.isArray(agent.allowlist) ? agent.allowlist : []];
	return {
		path: params.path ?? resolveExecApprovalsPath(),
		socketPath: expandHomePrefix(params.socketPath ?? file.socket?.path ?? resolveExecApprovalsSocketPath()),
		token: params.token ?? file.socket?.token ?? "",
		defaults: resolvedDefaults,
		agent: resolvedAgent,
		allowlist,
		file
	};
}
function requiresExecApproval(params) {
	return params.ask === "always" || params.ask === "on-miss" && params.security === "allowlist" && (!params.analysisOk || !params.allowlistSatisfied);
}
function recordAllowlistUse(approvals, agentId, entry, command, resolvedPath) {
	const target = agentId ?? DEFAULT_AGENT_ID;
	const agents = approvals.agents ?? {};
	const existing = agents[target] ?? {};
	const nextAllowlist = (Array.isArray(existing.allowlist) ? existing.allowlist : []).map((item) => item.pattern === entry.pattern ? {
		...item,
		id: item.id ?? crypto.randomUUID(),
		lastUsedAt: Date.now(),
		lastUsedCommand: command,
		lastResolvedPath: resolvedPath
	} : item);
	agents[target] = {
		...existing,
		allowlist: nextAllowlist
	};
	approvals.agents = agents;
	saveExecApprovals(approvals);
}
function addAllowlistEntry(approvals, agentId, pattern) {
	const target = agentId ?? DEFAULT_AGENT_ID;
	const agents = approvals.agents ?? {};
	const existing = agents[target] ?? {};
	const allowlist = Array.isArray(existing.allowlist) ? existing.allowlist : [];
	const trimmed = pattern.trim();
	if (!trimmed) return;
	if (allowlist.some((entry) => entry.pattern === trimmed)) return;
	allowlist.push({
		id: crypto.randomUUID(),
		pattern: trimmed,
		lastUsedAt: Date.now()
	});
	agents[target] = {
		...existing,
		allowlist
	};
	approvals.agents = agents;
	saveExecApprovals(approvals);
}
function minSecurity(a, b) {
	const order = {
		deny: 0,
		allowlist: 1,
		full: 2
	};
	return order[a] <= order[b] ? a : b;
}
function maxAsk(a, b) {
	const order = {
		off: 0,
		"on-miss": 1,
		always: 2
	};
	return order[a] >= order[b] ? a : b;
}

//#endregion
export { getTrustedSafeBinDirs as _, mergeExecApprovalsSocketDefaults as a, buildSafeShellCommand as b, readExecApprovalsSnapshot as c, resolveExecApprovals as d, resolveExecApprovalsFromFile as f, resolveSafeBins as g, evaluateShellAllowlist as h, maxAsk as i, recordAllowlistUse as l, evaluateExecAllowlist as m, addAllowlistEntry as n, minSecurity as o, saveExecApprovals as p, ensureExecApprovals as r, normalizeExecApprovals as s, DEFAULT_EXEC_APPROVAL_TIMEOUT_MS as t, requiresExecApproval as u, analyzeArgvCommand as v, requestJsonlSocket as x, buildSafeBinsShellCommand as y };