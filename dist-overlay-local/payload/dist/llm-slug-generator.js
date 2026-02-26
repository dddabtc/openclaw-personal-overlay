import "./paths-CyR9Pa1R.js";
import "./registry-BmY4gNy6.js";
import { c as resolveDefaultAgentId, r as resolveAgentDir, s as resolveAgentWorkspaceDir } from "./agent-scope-BaNPxUDt.js";
import "./subsystem-B5g771Td.js";
import "./workspace-C6WgTYr8.js";
import "./tokens-xJsz2RTu.js";
import { t as runEmbeddedPiAgent } from "./pi-embedded-D77SsO3m.js";
import "./plugins-TJvbNSdo.js";
import "./accounts-CfUI5fOs.js";
import "./boolean-B8-BqKGQ.js";
import "./command-format-Ck2WauwF.js";
import "./bindings-t1-P4kBT.js";
import "./send-D3-Ob9SN.js";
import "./send-BVPeEScS.js";
import "./deliver-Bvs9ufgc.js";
import "./diagnostic-D7GCxNJa.js";
import "./diagnostic-session-state-Bxo4UHOL.js";
import "./accounts-KXQIhk1d.js";
import "./send-C8AI48M3.js";
import "./image-ops-Di1Eegus.js";
import "./model-auth-Ya7dMhOr.js";
import "./github-copilot-token-Dgb9dAHW.js";
import "./pi-model-discovery-DaNAekda.js";
import "./message-channel-CQCCb6Xy.js";
import "./pi-embedded-helpers-CqRD7mjY.js";
import "./config-CysLz7WS.js";
import "./manifest-registry-CY0aE-kW.js";
import "./chrome-CKATdJ66.js";
import "./frontmatter-CdkBcBAo.js";
import "./skills-DLRwGFBf.js";
import "./redact-jSxx6Ep2.js";
import "./errors-BoQgnc8X.js";
import "./ssrf-BTMDZjHT.js";
import "./store-BhpNzGEt.js";
import "./thinking-2XQ3oVP7.js";
import "./accounts-nMA3v-oF.js";
import "./paths-BEAbheM8.js";
import "./tool-images-VEoh5TwB.js";
import "./image-Bfa1MZ8i.js";
import "./reply-prefix-BmXR6pJV.js";
import "./manager-BZc2TkTp.js";
import "./gemini-auth-rsohQGb3.js";
import "./sqlite-D-QJYTSW.js";
import "./retry-C1grpecz.js";
import "./target-errors-BGjeS36u.js";
import "./chunk-CWUSbsSi.js";
import "./markdown-tables-PH0_9MSV.js";
import "./local-roots-CiMZVqut.js";
import "./ir-CqsnSacn.js";
import "./render-CDCvpfhh.js";
import "./commands-registry-DGUlffbd.js";
import "./skill-commands-D-jjc5h0.js";
import "./runner-CccmbQfu.js";
import "./fetch-DtI0mtzx.js";
import "./channel-activity--Llibokq.js";
import "./tables-B5n9kpwW.js";
import "./send-CzjNLBot.js";
import "./outbound-attachment-B7UkTnbO.js";
import "./send-Be0LFAV3.js";
import "./resolve-route-iHUEniXo.js";
import "./proxy-CBJ1upuz.js";
import "./replies-CmKGsIjb.js";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

//#region src/hooks/llm-slug-generator.ts
/**
* LLM-based slug generator for session memory filenames
*/
/**
* Generate a short 1-2 word filename slug from session content using LLM
*/
async function generateSlugViaLLM(params) {
	let tempSessionFile = null;
	try {
		const agentId = resolveDefaultAgentId(params.cfg);
		const workspaceDir = resolveAgentWorkspaceDir(params.cfg, agentId);
		const agentDir = resolveAgentDir(params.cfg, agentId);
		const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-slug-"));
		tempSessionFile = path.join(tempDir, "session.jsonl");
		const prompt = `Based on this conversation, generate a short 1-2 word filename slug (lowercase, hyphen-separated, no file extension).

Conversation summary:
${params.sessionContent.slice(0, 2e3)}

Reply with ONLY the slug, nothing else. Examples: "vendor-pitch", "api-design", "bug-fix"`;
		const result = await runEmbeddedPiAgent({
			sessionId: `slug-generator-${Date.now()}`,
			sessionKey: "temp:slug-generator",
			agentId,
			sessionFile: tempSessionFile,
			workspaceDir,
			agentDir,
			config: params.cfg,
			prompt,
			timeoutMs: 15e3,
			runId: `slug-gen-${Date.now()}`
		});
		if (result.payloads && result.payloads.length > 0) {
			const text = result.payloads[0]?.text;
			if (text) return text.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || null;
		}
		return null;
	} catch (err) {
		console.error("[llm-slug-generator] Failed to generate slug:", err);
		return null;
	} finally {
		if (tempSessionFile) try {
			await fs.rm(path.dirname(tempSessionFile), {
				recursive: true,
				force: true
			});
		} catch {}
	}
}

//#endregion
export { generateSlugViaLLM };