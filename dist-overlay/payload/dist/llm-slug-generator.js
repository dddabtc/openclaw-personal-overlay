import { a as resolveAgentEffectiveModelPrimary, c as resolveDefaultAgentId, i as resolveAgentDir, s as resolveAgentWorkspaceDir } from "./agent-scope-DfPRIj4l.js";
import "./paths-CRyD285O.js";
import { t as createSubsystemLogger } from "./subsystem-gWhP9HUz.js";
import "./workspace-CoXkK9vh.js";
import { it as DEFAULT_PROVIDER, l as parseModelRef, rt as DEFAULT_MODEL } from "./model-selection-DzQXaRi3.js";
import "./github-copilot-token-C_a0oOIO.js";
import "./env-DAOIQ0Je.js";
import "./boolean-mcn6kL0s.js";
import "./tokens-CmeDnU40.js";
import { t as runEmbeddedPiAgent } from "./pi-embedded-DGsh1hxQ.js";
import "./plugins-COkGaVNw.js";
import "./accounts-DqCt-wQc.js";
import "./bindings-OOnNFCB_.js";
import "./send-B9rxILPV.js";
import "./send-KHNmDSc8.js";
import "./deliver-BDTCk6Zp.js";
import "./diagnostic-J8y9RHcI.js";
import "./diagnostic-session-state-C0Sxjfox.js";
import "./accounts-VI6oRB4t.js";
import "./send-CJ330W-T.js";
import "./image-ops-aD0BGevY.js";
import "./pi-model-discovery-C-yOXpma.js";
import "./message-channel-DNQoN51i.js";
import "./pi-embedded-helpers-DdtgKBS8.js";
import "./config-DPEn0sA9.js";
import "./manifest-registry-BjPRbY8q.js";
import "./dock-C7qdzomy.js";
import "./chrome-DUrZscND.js";
import "./ssrf-fLpTpy3w.js";
import "./frontmatter-DhbnPOGB.js";
import "./skills-C9mKKXRT.js";
import "./redact-DPmHLmw9.js";
import "./errors-Dt3U1F5S.js";
import "./fs-safe-BFmsMcLL.js";
import "./store-D020k9N1.js";
import "./sessions-CUpCpsNI.js";
import "./accounts-OCKm8qxp.js";
import "./paths-DtNnHbet.js";
import "./tool-images-D5ANUCus.js";
import "./thinking-6RspTgk5.js";
import "./image-CzHSa-_X.js";
import "./reply-prefix-DV1guQI1.js";
import "./manager-Cprlyvh8.js";
import "./gemini-auth-RlLwqORB.js";
import "./fetch-guard-B6nV3reU.js";
import "./query-expansion-5BdZBFZd.js";
import "./retry-C3uWyooV.js";
import "./target-errors-CluUfAVP.js";
import "./chunk-DkaSmp4f.js";
import "./markdown-tables-CgjQWqNB.js";
import "./local-roots-CFUHsj1i.js";
import "./ir-DV5PQ0dW.js";
import "./render-D7ZNn_WS.js";
import "./commands-registry-frk9-cYB.js";
import "./skill-commands-y-84rIVE.js";
import "./runner-B8op_Hh1.js";
import "./fetch-DTTG_w9o.js";
import "./channel-activity-CamRvc2O.js";
import "./tables-B8ymTOL-.js";
import "./send-yk9iQO_y.js";
import "./outbound-attachment-CUKcVG-h.js";
import "./send-Cavm8sGw.js";
import "./resolve-route-CJwOROn_.js";
import "./proxy-BMa4czGu.js";
import "./replies-BWK-p2vT.js";
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