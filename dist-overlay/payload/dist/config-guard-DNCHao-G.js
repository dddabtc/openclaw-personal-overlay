import "./paths-B4BZAPZh.js";
import { B as theme, R as colorize, S as shortenHomePath, z as isRich } from "./utils-BvKkAKT3.js";
import "./agent-scope-D8gw-U5c.js";
import "./subsystem-Bqlcd6-a.js";
import "./exec-CAIB93jD.js";
import "./model-selection-BnthIvhe.js";
import "./github-copilot-token-nncItI8D.js";
import { t as formatCliCommand } from "./command-format-ChfKqObn.js";
import "./boolean-BgXe2hyu.js";
import "./env-SxoKgHK1.js";
import "./host-env-security-ljCLeQmh.js";
import "./message-channel-CmNH1i-8.js";
import { o as readConfigFileSnapshot } from "./config-Ca77L3N1.js";
import "./env-vars-CvvqezS9.js";
import "./manifest-registry-L8eulu9n.js";
import "./dock-BAyVFjoI.js";
import "./sessions-BydE9SSo.js";
import "./plugins-DayOjXZ9.js";
import "./accounts-mX89jP1j.js";
import "./accounts-WdSU9oY0.js";
import "./accounts-qzL_Ozg5.js";
import "./bindings-DaFjLbOa.js";
import "./logging-6RmrnEvA.js";
import "./paths-DlJnj-kN.js";
import "./chat-envelope-BndZPORx.js";
import "./exec-approvals-allowlist-Bwies_rF.js";
import "./exec-safe-bin-runtime-policy-eTihvraK.js";
import "./plugin-auto-enable-rIpFqItI.js";
import "./prompt-style-D72x12nr.js";
import { c as shouldMigrateStateFromPath } from "./argv-CN60i8bt.js";
import "./note-QMq9f9-I.js";
import { t as loadAndMaybeMigrateDoctorConfig } from "./doctor-config-flow-DU_OPe7h.js";

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