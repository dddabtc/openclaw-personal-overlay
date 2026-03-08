import { a as resolveAgentEffectiveModelPrimary, c as resolveDefaultAgentId, i as resolveAgentDir, s as resolveAgentWorkspaceDir } from "./agent-scope-DBH4tc6E.js";
import "./paths-C9do7WCN.js";
import { t as createSubsystemLogger } from "./subsystem-DhjIxims.js";
import "./workspace-jH04VzX-.js";
import { it as DEFAULT_PROVIDER, l as parseModelRef, rt as DEFAULT_MODEL } from "./model-selection-w6ucPeWO.js";
import "./github-copilot-token-BkwQAVvU.js";
import "./env-ClJSw9gs.js";
import "./boolean-mcn6kL0s.js";
import "./tokens-fYdHc5Il.js";
import { t as runEmbeddedPiAgent } from "./pi-embedded-CId9gqP3.js";
import "./plugins-C1VUBuby.js";
import "./accounts-CfKX8yG7.js";
import "./bindings-CDK0IrP0.js";
import "./send-a1VWNOHV.js";
import "./send-Cw0_ZiTX.js";
import "./deliver-BeOJWYth.js";
import "./diagnostic-DQjjW919.js";
import "./diagnostic-session-state-C0Sxjfox.js";
import "./accounts-cHckgn_t.js";
import "./send-BiqYG7oR.js";
import "./image-ops-BhxPhYFk.js";
import "./pi-model-discovery-C-yOXpma.js";
import "./message-channel-pwZqDIgx.js";
import "./pi-embedded-helpers-BgYUaSDq.js";
import "./config-CyPYPMkz.js";
import "./manifest-registry-BT84-RS7.js";
import "./dock-DZ4pzoln.js";
import "./chrome-CcrVABjD.js";
import "./ssrf-fLpTpy3w.js";
import "./frontmatter-CYyVkHva.js";
import "./skills-BBsi_dtC.js";
import "./redact-SGQAq28W.js";
import "./errors-DCpmSNbo.js";
import "./fs-safe-BFmsMcLL.js";
import "./store-CYaLnTp3.js";
import "./sessions-C9kw3nkg.js";
import "./accounts-DXV3Uvzx.js";
import "./paths-PSh4fBQD.js";
import "./tool-images-CR47IyyS.js";
import "./thinking-6RspTgk5.js";
import "./image-EizydwYA.js";
import "./reply-prefix-CcDJywCq.js";
import "./manager-BJQTTP5s.js";
import "./gemini-auth-BSk0KCpC.js";
import "./fetch-guard-BYswKNH0.js";
import "./query-expansion-CdGiZbeS.js";
import "./retry-BxRFAOR_.js";
import "./target-errors-DJuiiQI2.js";
import "./chunk-BI4_3V6t.js";
import "./markdown-tables-BoOL-Y6h.js";
import "./local-roots-BqL3X_i0.js";
import "./ir-BXqInHn9.js";
import "./render-D7ZNn_WS.js";
import "./commands-registry-BT9619S7.js";
import "./skill-commands-Bf82eL6s.js";
import "./runner-D1Afuzkr.js";
import "./fetch-DTTG_w9o.js";
import "./channel-activity-BRGWkG9d.js";
import "./tables-C-Mxp4A9.js";
import "./send-Cf1Vq3Nw.js";
import "./outbound-attachment-CaGRyfCX.js";
import "./send-DsdsfS6s.js";
import "./resolve-route-BsYELmmd.js";
import "./proxy-BMa4czGu.js";
import "./replies-CSQqUYSm.js";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

//#region src/hooks/llm-slug-generator.ts
/**
* LLM-based slug generator for session memory filenames
*/
const log = createSubsystemLogger("llm-slug-generator");
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
		const modelRef = resolveAgentEffectiveModelPrimary(params.cfg, agentId);
		const parsed = modelRef ? parseModelRef(modelRef, DEFAULT_PROVIDER) : null;
		const provider = parsed?.provider ?? DEFAULT_PROVIDER;
		const model = parsed?.model ?? DEFAULT_MODEL;
		const result = await runEmbeddedPiAgent({
			sessionId: `slug-generator-${Date.now()}`,
			sessionKey: "temp:slug-generator",
			agentId,
			sessionFile: tempSessionFile,
			workspaceDir,
			agentDir,
			config: params.cfg,
			prompt,
			provider,
			model,
			timeoutMs: 15e3,
			runId: `slug-gen-${Date.now()}`
		});
		if (result.payloads && result.payloads.length > 0) {
			const text = result.payloads[0]?.text;
			if (text) return text.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || null;
		}
		return null;
	} catch (err) {
		const message = err instanceof Error ? err.stack ?? err.message : String(err);
		log.error(`Failed to generate slug: ${message}`);
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