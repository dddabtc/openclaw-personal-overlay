import { a as resolveAgentDir, c as resolveAgentWorkspaceDir, l as resolveDefaultAgentId, o as resolveAgentEffectiveModelPrimary } from "./run-with-concurrency-Dz4ZBsiB.js";
import "./paths-DkxwiA8g.js";
import { t as createSubsystemLogger } from "./subsystem-C9Gk4AAH.js";
import "./workspace-N-w3YxwR.js";
import "./logger-CJbXRTpA.js";
import { Mr as DEFAULT_PROVIDER, l as parseModelRef } from "./model-selection-BPSJNV1m.js";
import "./github-copilot-token-8N63GdbE.js";
import "./legacy-names-dyOVyQ4G.js";
import "./thinking-CeokMk4d.js";
import "./tokens-C27XM9Ox.js";
import { t as runEmbeddedPiAgent } from "./pi-embedded-BqMLaUfK.js";
import "./plugins-DziabxS9.js";
import "./accounts-N-kltVGR.js";
import "./send-CYZDys-m.js";
import "./send-vOjg4RvO.js";
import "./deliver-YYFfrsTk.js";
import "./diagnostic-DENsBzpJ.js";
import "./accounts-BKYCbdnh.js";
import "./image-ops-CgbthA1d.js";
import "./send-C-2jiLtL.js";
import "./pi-model-discovery-DFsjK5qR.js";
import "./pi-embedded-helpers-UBvLlZ4y.js";
import "./chrome-CJkW-A2q.js";
import "./frontmatter-DR8lvaM9.js";
import "./skills-CXtBlvSl.js";
import "./path-alias-guards-DGYCiXxw.js";
import "./redact-Cx40Dm28.js";
import "./errors-DopTfGpy.js";
import "./fs-safe-oQRM60Ha.js";
import "./proxy-env-CKMZMH7P.js";
import "./store-C2MCa3R9.js";
import "./paths-xqWXix_o.js";
import "./tool-images-C7WBa8bh.js";
import "./image-DUdnUxSL.js";
import "./audio-transcription-runner-Cgui9HIY.js";
import "./fetch-BOsAhlie.js";
import "./fetch-guard-DUaK4800.js";
import "./api-key-rotation-UUPMd7AY.js";
import "./proxy-fetch-53_Tkfsi.js";
import "./ir-B6fug1VF.js";
import "./render-7C7EDC8_.js";
import "./target-errors-tjJv0qi0.js";
import "./commands-registry-C79Pvp29.js";
import "./skill-commands-BLGVvnUq.js";
import "./fetch-CONQGbzL.js";
import "./channel-activity-BoGQ1glY.js";
import "./tables-Yp1X47PI.js";
import "./send-GuiGXerA.js";
import "./outbound-attachment-iBGau-cJ.js";
import "./send-BC5yjJJF.js";
import "./proxy-BzwL4n0W.js";
import "./manager-7fpWwHd3.js";
import "./query-expansion-CrQZXi2l.js";
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
		const provider = parsed?.provider ?? "anthropic";
		const model = parsed?.model ?? "claude-opus-4-6";
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
