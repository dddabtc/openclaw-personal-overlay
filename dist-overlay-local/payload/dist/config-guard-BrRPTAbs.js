import "./paths-B4BZAPZh.js";
import { B as theme, R as colorize, S as shortenHomePath, z as isRich } from "./utils-CP9YLh6M.js";
import "./registry-B-j4DRfe.js";
import "./subsystem-BCQGGxdd.js";
import "./exec-DYqRzFbo.js";
import "./agent-scope-B36jktKj.js";
import "./model-selection-mHHEzs4Y.js";
import "./github-copilot-token-D2zp6kMZ.js";
import { t as formatCliCommand } from "./command-format-DEKzLnLg.js";
import "./boolean-BsqeuxE6.js";
import "./env-VriqyjXT.js";
import "./message-channel-Bena1Tzd.js";
import { o as readConfigFileSnapshot } from "./config-HiRdak1Z.js";
import "./manifest-registry-D2lPzXIl.js";
import "./sessions-CLVPlumA.js";
import "./dock-SQwuNDYw.js";
import "./plugins-CTO4bTbI.js";
import "./accounts-CznR-8mo.js";
import "./accounts-Dq_1iSiE.js";
import "./accounts-DTj1Pkjk.js";
import "./bindings-Dnyf3pJk.js";
import "./logging-w5jq5901.js";
import "./paths-C6eomcf_.js";
import "./prompt-style-CRlXV9eX.js";
import { c as shouldMigrateStateFromPath } from "./argv-iDNY1AU9.js";
import "./catalog-DxFePbMV.js";
import "./note-B-B5QmzA.js";
import "./plugin-auto-enable-DfpMea6l.js";
import { t as loadAndMaybeMigrateDoctorConfig } from "./doctor-config-flow-Bx_A3yDM.js";

//#region src/cli/program/config-guard.ts
const ALLOWED_INVALID_COMMANDS = new Set([
	"doctor",
	"logs",
	"health",
	"help",
	"status"
]);
const ALLOWED_INVALID_GATEWAY_SUBCOMMANDS = new Set([
	"status",
	"probe",
	"health",
	"discover",
	"call",
	"install",
	"uninstall",
	"start",
	"stop",
	"restart"
]);
let didRunDoctorConfigFlow = false;
let configSnapshotPromise = null;
function formatConfigIssues(issues) {
	return issues.map((issue) => `- ${issue.path || "<root>"}: ${issue.message}`);
}
async function getConfigSnapshot() {
	if (process.env.VITEST === "true") return readConfigFileSnapshot();
	configSnapshotPromise ??= readConfigFileSnapshot();
	return configSnapshotPromise;
}
async function ensureConfigReady(params) {
	const commandPath = params.commandPath ?? [];
	if (!didRunDoctorConfigFlow && shouldMigrateStateFromPath(commandPath)) {
		didRunDoctorConfigFlow = true;
		await loadAndMaybeMigrateDoctorConfig({
			options: { nonInteractive: true },
			confirm: async () => false
		});
	}
	const snapshot = await getConfigSnapshot();
	const commandName = commandPath[0];
	const subcommandName = commandPath[1];
	const allowInvalid = commandName ? ALLOWED_INVALID_COMMANDS.has(commandName) || commandName === "gateway" && subcommandName && ALLOWED_INVALID_GATEWAY_SUBCOMMANDS.has(subcommandName) : false;
	const issues = snapshot.exists && !snapshot.valid ? formatConfigIssues(snapshot.issues) : [];
	const legacyIssues = snapshot.legacyIssues.length > 0 ? snapshot.legacyIssues.map((issue) => `- ${issue.path}: ${issue.message}`) : [];
	if (!(snapshot.exists && !snapshot.valid)) return;
	const rich = isRich();
	const muted = (value) => colorize(rich, theme.muted, value);
	const error = (value) => colorize(rich, theme.error, value);
	const heading = (value) => colorize(rich, theme.heading, value);
	const commandText = (value) => colorize(rich, theme.command, value);
	params.runtime.error(heading("Config invalid"));
	params.runtime.error(`${muted("File:")} ${muted(shortenHomePath(snapshot.path))}`);
	if (issues.length > 0) {
		params.runtime.error(muted("Problem:"));
		params.runtime.error(issues.map((issue) => `  ${error(issue)}`).join("\n"));
	}
	if (legacyIssues.length > 0) {
		params.runtime.error(muted("Legacy config keys detected:"));
		params.runtime.error(legacyIssues.map((issue) => `  ${error(issue)}`).join("\n"));
	}
	params.runtime.error("");
	params.runtime.error(`${muted("Run:")} ${commandText(formatCliCommand("openclaw doctor --fix"))}`);
	if (!allowInvalid) params.runtime.exit(1);
}

//#endregion
export { ensureConfigReady };