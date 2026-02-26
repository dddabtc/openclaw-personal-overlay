import path from "node:path";

//#region src/infra/system-run-command.ts
function basenameLower(token) {
	const win = path.win32.basename(token);
	const posix = path.posix.basename(token);
	return (win.length < posix.length ? win : posix).trim().toLowerCase();
}
function formatExecCommand(argv) {
	return argv.map((arg) => {
		const trimmed = arg.trim();
		if (!trimmed) return "\"\"";
		if (!/\s|"/.test(trimmed)) return trimmed;
		return `"${trimmed.replace(/"/g, "\\\"")}"`;
	}).join(" ");
}
function extractShellCommandFromArgv(argv) {
	const token0 = argv[0]?.trim();
	if (!token0) return null;
	const base0 = basenameLower(token0);
	if (base0 === "sh" || base0 === "bash" || base0 === "zsh" || base0 === "dash" || base0 === "ksh") {
		const flag = argv[1]?.trim();
		if (flag !== "-lc" && flag !== "-c") return null;
		const cmd = argv[2];
		return typeof cmd === "string" ? cmd : null;
	}
	if (base0 === "cmd.exe" || base0 === "cmd") {
		const idx = argv.findIndex((item) => String(item).trim().toLowerCase() === "/c");
		if (idx === -1) return null;
		const tail = argv.slice(idx + 1).map((item) => String(item));
		if (tail.length === 0) return null;
		const cmd = tail.join(" ").trim();
		return cmd.length > 0 ? cmd : null;
	}
	return null;
}
function validateSystemRunCommandConsistency(params) {
	const raw = typeof params.rawCommand === "string" && params.rawCommand.trim().length > 0 ? params.rawCommand.trim() : null;
	const shellCommand = extractShellCommandFromArgv(params.argv);
	const inferred = shellCommand !== null ? shellCommand.trim() : formatExecCommand(params.argv);
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
		shellCommand: shellCommand !== null ? raw ?? shellCommand : null,
		cmdText: raw ?? shellCommand ?? inferred
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
export { resolveSystemRunCommand as t };