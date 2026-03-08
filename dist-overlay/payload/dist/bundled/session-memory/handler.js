import { c as resolveAgentWorkspaceDir } from "../../run-with-concurrency-Dz4ZBsiB.js";
import { c as resolveStateDir } from "../../paths-DkxwiA8g.js";
import { t as createSubsystemLogger } from "../../subsystem-C9Gk4AAH.js";
import { B as resolveAgentIdFromSessionKey } from "../../workspace-N-w3YxwR.js";
import "../../logger-CJbXRTpA.js";
import "../../model-selection-DySR-m8p.js";
import "../../github-copilot-token-8N63GdbE.js";
import "../../legacy-names-dyOVyQ4G.js";
import "../../thinking-Bh79Lk76.js";
import "../../tokens-C27XM9Ox.js";
import "../../pi-embedded-KhSY-5OZ.js";
import "../../plugins-Dl3Pc1oJ.js";
import "../../accounts-nm0_gAPL.js";
import "../../send-nMac99Ls.js";
import "../../send-CBJZWAal.js";
import "../../deliver-Bk8FKt3S.js";
import "../../diagnostic-CfSK2c-I.js";
import "../../accounts-DumiF_I1.js";
import "../../image-ops-Dig0LEC0.js";
import "../../send-C8IcJJvc.js";
import "../../pi-model-discovery-DleGyq0H.js";
import { pt as hasInterSessionUserProvenance } from "../../pi-embedded-helpers-D4DnmzQj.js";
import "../../chrome-BSn5eTOU.js";
import "../../frontmatter-DR8lvaM9.js";
import "../../skills-Cst1922L.js";
import "../../path-alias-guards-DGYCiXxw.js";
import "../../redact-Cx40Dm28.js";
import "../../errors-DopTfGpy.js";
import { c as writeFileWithinRoot } from "../../fs-safe-oQRM60Ha.js";
import "../../proxy-env-561Kv0ja.js";
import "../../store-C27BiEyn.js";
import "../../paths-xqWXix_o.js";
import "../../tool-images-D8fA7TdQ.js";
import "../../image-DltW_1Yr.js";
import "../../audio-transcription-runner-C4j34sQn.js";
import "../../fetch-PoeSt18q.js";
import "../../fetch-guard-D1rPO4B_.js";
import "../../api-key-rotation-DrHpu8g5.js";
import "../../proxy-fetch-53_Tkfsi.js";
import "../../ir-xlxNcrQy.js";
import "../../render-7C7EDC8_.js";
import "../../target-errors-AjeDhjCI.js";
import "../../commands-registry-vr4-PUYk.js";
import "../../skill-commands-BkZ-7Fga.js";
import "../../fetch-CONQGbzL.js";
import "../../channel-activity-BoQ6LIGa.js";
import "../../tables-B6YmJkD6.js";
import "../../send-D5RzKSt1.js";
import "../../outbound-attachment-BtZAplOu.js";
import "../../send-BRVP4hUT.js";
import "../../proxy-BzwL4n0W.js";
import "../../manager-BxUv3Br4.js";
import "../../query-expansion-CrQZXi2l.js";
import { generateSlugViaLLM } from "../../llm-slug-generator.js";
import { t as resolveHookConfig } from "../../config-Bs6iYHRw.js";
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
		await writeFileWithinRoot({
			rootDir: memoryDir,
			relativePath: filename,
			data: entryParts.join("\n"),
			encoding: "utf-8"
		});
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
