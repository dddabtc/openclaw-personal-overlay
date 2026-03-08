import { s as resolveAgentWorkspaceDir } from "../../agent-scope-DfPRIj4l.js";
import { s as resolveStateDir } from "../../paths-CRyD285O.js";
import { t as createSubsystemLogger } from "../../subsystem-gWhP9HUz.js";
import { l as resolveAgentIdFromSessionKey } from "../../session-key-YGVrIVO5.js";
import "../../workspace-CoXkK9vh.js";
import "../../model-selection-DzQXaRi3.js";
import "../../github-copilot-token-C_a0oOIO.js";
import "../../env-DAOIQ0Je.js";
import "../../boolean-mcn6kL0s.js";
import "../../tokens-CmeDnU40.js";
import "../../pi-embedded-DGsh1hxQ.js";
import "../../plugins-COkGaVNw.js";
import "../../accounts-DqCt-wQc.js";
import "../../bindings-OOnNFCB_.js";
import "../../send-B9rxILPV.js";
import "../../send-KHNmDSc8.js";
import "../../deliver-BDTCk6Zp.js";
import "../../diagnostic-J8y9RHcI.js";
import "../../diagnostic-session-state-C0Sxjfox.js";
import "../../accounts-VI6oRB4t.js";
import "../../send-CJ330W-T.js";
import "../../image-ops-aD0BGevY.js";
import "../../pi-model-discovery-C-yOXpma.js";
import "../../message-channel-DNQoN51i.js";
import "../../pi-embedded-helpers-DdtgKBS8.js";
import "../../config-DPEn0sA9.js";
import "../../manifest-registry-BjPRbY8q.js";
import "../../dock-C7qdzomy.js";
import "../../chrome-DUrZscND.js";
import "../../ssrf-fLpTpy3w.js";
import "../../frontmatter-DhbnPOGB.js";
import "../../skills-C9mKKXRT.js";
import "../../redact-DPmHLmw9.js";
import "../../errors-Dt3U1F5S.js";
import "../../fs-safe-BFmsMcLL.js";
import "../../store-D020k9N1.js";
import { O as hasInterSessionUserProvenance } from "../../sessions-CUpCpsNI.js";
import "../../accounts-OCKm8qxp.js";
import "../../paths-DtNnHbet.js";
import "../../tool-images-D5ANUCus.js";
import "../../thinking-6RspTgk5.js";
import "../../image-CzHSa-_X.js";
import "../../reply-prefix-DV1guQI1.js";
import "../../manager-Cprlyvh8.js";
import "../../gemini-auth-RlLwqORB.js";
import "../../fetch-guard-B6nV3reU.js";
import "../../query-expansion-5BdZBFZd.js";
import "../../retry-C3uWyooV.js";
import "../../target-errors-CluUfAVP.js";
import "../../chunk-DkaSmp4f.js";
import "../../markdown-tables-CgjQWqNB.js";
import "../../local-roots-CFUHsj1i.js";
import "../../ir-DV5PQ0dW.js";
import "../../render-D7ZNn_WS.js";
import "../../commands-registry-frk9-cYB.js";
import "../../skill-commands-y-84rIVE.js";
import "../../runner-B8op_Hh1.js";
import "../../fetch-DTTG_w9o.js";
import "../../channel-activity-CamRvc2O.js";
import "../../tables-B8ymTOL-.js";
import "../../send-yk9iQO_y.js";
import "../../outbound-attachment-CUKcVG-h.js";
import "../../send-Cavm8sGw.js";
import "../../resolve-route-CJwOROn_.js";
import "../../proxy-BMa4czGu.js";
import "../../replies-BWK-p2vT.js";
import { generateSlugViaLLM } from "../../llm-slug-generator.js";
import { t as resolveHookConfig } from "../../config-B2xc8slk.js";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

//#region src/hooks/bundled/session-memory/handler.ts
/**
* Session memory hook handler
*
* Saves session context to memory when /new or /reset command is triggered
* Creates a new dated memory file with LLM-generated slug
*/
const log = createSubsystemLogger("hooks/session-memory");
/**
* Read recent messages from session file for slug generation
*/
async function getRecentSessionContent(sessionFilePath, messageCount = 15) {
	try {
		const lines = (await fs.readFile(sessionFilePath, "utf-8")).trim().split("\n");
		const allMessages = [];
		for (const line of lines) try {
			const entry = JSON.parse(line);
			if (entry.type === "message" && entry.message) {
				const msg = entry.message;
				const role = msg.role;
				if ((role === "user" || role === "assistant") && msg.content) {
					if (role === "user" && hasInterSessionUserProvenance(msg)) continue;
					const text = Array.isArray(msg.content) ? msg.content.find((c) => c.type === "text")?.text : msg.content;
					if (text && !text.startsWith("/")) allMessages.push(`${role}: ${text}`);
				}
			}
		} catch {}
		return allMessages.slice(-messageCount).join("\n");
	} catch {
		return null;
	}
}
/**
* Try the active transcript first; if /new already rotated it,
* fallback to the latest .jsonl.reset.* sibling.
*/
async function getRecentSessionContentWithResetFallback(sessionFilePath, messageCount = 15) {
	const primary = await getRecentSessionContent(sessionFilePath, messageCount);
	if (primary) return primary;
	try {
		const dir = path.dirname(sessionFilePath);
		const resetPrefix = `${path.basename(sessionFilePath)}.reset.`;
		const resetCandidates = (await fs.readdir(dir)).filter((name) => name.startsWith(resetPrefix)).toSorted();
		if (resetCandidates.length === 0) return primary;
		const latestResetPath = path.join(dir, resetCandidates[resetCandidates.length - 1]);
		const fallback = await getRecentSessionContent(latestResetPath, messageCount);
		if (fallback) log.debug("Loaded session content from reset fallback", {
			sessionFilePath,
			latestResetPath
		});
		return fallback || primary;
	} catch {
		return primary;
	}
}
function stripResetSuffix(fileName) {
	const resetIndex = fileName.indexOf(".reset.");
	return resetIndex === -1 ? fileName : fileName.slice(0, resetIndex);
}
async function findPreviousSessionFile(params) {
	try {
		const files = await fs.readdir(params.sessionsDir);
		const fileSet = new Set(files);
		const baseFromReset = params.currentSessionFile ? stripResetSuffix(path.basename(params.currentSessionFile)) : void 0;
		if (baseFromReset && fileSet.has(baseFromReset)) return path.join(params.sessionsDir, baseFromReset);
		const trimmedSessionId = params.sessionId?.trim();
		if (trimmedSessionId) {
			const canonicalFile = `${trimmedSessionId}.jsonl`;
			if (fileSet.has(canonicalFile)) return path.join(params.sessionsDir, canonicalFile);
			const topicVariants = files.filter((name) => name.startsWith(`${trimmedSessionId}-topic-`) && name.endsWith(".jsonl") && !name.includes(".reset.")).toSorted().toReversed();
			if (topicVariants.length > 0) return path.join(params.sessionsDir, topicVariants[0]);
		}
		if (!params.currentSessionFile) return;
		const nonResetJsonl = files.filter((name) => name.endsWith(".jsonl") && !name.includes(".reset.")).toSorted().toReversed();
		if (nonResetJsonl.length > 0) return path.join(params.sessionsDir, nonResetJsonl[0]);
	} catch {}
}
/**
* Save session context to memory when /new or /reset command is triggered
*/
const saveSessionToMemory = async (event) => {
	const isResetCommand = event.action === "new" || event.action === "reset";
	if (event.type !== "command" || !isResetCommand) return;
	try {
		log.debug("Hook triggered for reset/new command", { action: event.action });
		const context = event.context || {};
		const cfg = context.cfg;
		const agentId = resolveAgentIdFromSessionKey(event.sessionKey);
		const workspaceDir = cfg ? resolveAgentWorkspaceDir(cfg, agentId) : path.join(resolveStateDir(process.env, os.homedir), "workspace");
		const memoryDir = path.join(workspaceDir, "memory");
		await fs.mkdir(memoryDir, { recursive: true });
		const now = new Date(event.timestamp);
		const dateStr = now.toISOString().split("T")[0];
		const sessionEntry = context.previousSessionEntry || context.sessionEntry || {};
		const currentSessionId = sessionEntry.sessionId;
		let currentSessionFile = sessionEntry.sessionFile || void 0;
		if (!currentSessionFile || currentSessionFile.includes(".reset.")) {
			const sessionsDirs = /* @__PURE__ */ new Set();
			if (currentSessionFile) sessionsDirs.add(path.dirname(currentSessionFile));
			sessionsDirs.add(path.join(workspaceDir, "sessions"));
			for (const sessionsDir of sessionsDirs) {
				const recoveredSessionFile = await findPreviousSessionFile({
					sessionsDir,
					currentSessionFile,
					sessionId: currentSessionId
				});
				if (!recoveredSessionFile) continue;
				currentSessionFile = recoveredSessionFile;
				log.debug("Found previous session file", { file: currentSessionFile });
				break;
			}
		}
		log.debug("Session context resolved", {
			sessionId: currentSessionId,
			sessionFile: currentSessionFile,
			hasCfg: Boolean(cfg)
		});
		const sessionFile = currentSessionFile || void 0;
		const hookConfig = resolveHookConfig(cfg, "session-memory");
		const messageCount = typeof hookConfig?.messages === "number" && hookConfig.messages > 0 ? hookConfig.messages : 15;
		let slug = null;
		let sessionContent = null;
		if (sessionFile) {
			sessionContent = await getRecentSessionContentWithResetFallback(sessionFile, messageCount);
			log.debug("Session content loaded", {
				length: sessionContent?.length ?? 0,
				messageCount
			});
			const allowLlmSlug = !(process.env.OPENCLAW_TEST_FAST === "1" || process.env.VITEST === "true" || process.env.VITEST === "1" || false) && hookConfig?.llmSlug !== false;
			if (sessionContent && cfg && allowLlmSlug) {
				log.debug("Calling generateSlugViaLLM...");
				slug = await generateSlugViaLLM({
					sessionContent,
					cfg
				});
				log.debug("Generated slug", { slug });
			}
		}
		if (!slug) {
			slug = now.toISOString().split("T")[1].split(".")[0].replace(/:/g, "").slice(0, 4);
			log.debug("Using fallback timestamp slug", { slug });
		}
		const filename = `${dateStr}-${slug}.md`;
		const memoryFilePath = path.join(memoryDir, filename);
		log.debug("Memory file path resolved", {
			filename,
			path: memoryFilePath.replace(os.homedir(), "~")
		});
		const timeStr = now.toISOString().split("T")[1].split(".")[0];
		const sessionId = sessionEntry.sessionId || "unknown";
		const source = context.commandSource || "unknown";
		const entryParts = [
			`# Session: ${dateStr} ${timeStr} UTC`,
			"",
			`- **Session Key**: ${event.sessionKey}`,
			`- **Session ID**: ${sessionId}`,
			`- **Source**: ${source}`,
			""
		];
		if (sessionContent) entryParts.push("## Conversation Summary", "", sessionContent, "");
		const entry = entryParts.join("\n");
		await fs.writeFile(memoryFilePath, entry, "utf-8");
		log.debug("Memory file written successfully");
		const relPath = memoryFilePath.replace(os.homedir(), "~");
		log.info(`Session context saved to ${relPath}`);
	} catch (err) {
		if (err instanceof Error) log.error("Failed to save session memory", {
			errorName: err.name,
			errorMessage: err.message,
			stack: err.stack
		});
		else log.error("Failed to save session memory", { error: String(err) });
	}
};

//#endregion
export { saveSessionToMemory as default };