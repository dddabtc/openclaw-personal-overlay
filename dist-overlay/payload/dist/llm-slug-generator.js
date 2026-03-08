import { a as resolveAgentDir, c as resolveAgentWorkspaceDir, l as resolveDefaultAgentId, o as resolveAgentEffectiveModelPrimary } from "./run-with-concurrency-Dz4ZBsiB.js";
import "./paths-DkxwiA8g.js";
import { t as createSubsystemLogger } from "./subsystem-C9Gk4AAH.js";
import "./workspace-N-w3YxwR.js";
import "./logger-CJbXRTpA.js";
import { Mr as DEFAULT_PROVIDER, l as parseModelRef } from "./model-selection-DySR-m8p.js";
import "./github-copilot-token-8N63GdbE.js";
import "./legacy-names-dyOVyQ4G.js";
import "./thinking-Bh79Lk76.js";
import "./tokens-C27XM9Ox.js";
import { t as runEmbeddedPiAgent } from "./pi-embedded-KhSY-5OZ.js";
import "./plugins-Dl3Pc1oJ.js";
import "./accounts-nm0_gAPL.js";
import "./send-nMac99Ls.js";
import "./send-CBJZWAal.js";
import "./deliver-Bk8FKt3S.js";
import "./diagnostic-CfSK2c-I.js";
import "./accounts-DumiF_I1.js";
import "./image-ops-Dig0LEC0.js";
import "./send-C8IcJJvc.js";
import "./pi-model-discovery-DleGyq0H.js";
import "./pi-embedded-helpers-D4DnmzQj.js";
import "./chrome-BSn5eTOU.js";
import "./frontmatter-DR8lvaM9.js";
import "./skills-Cst1922L.js";
import "./path-alias-guards-DGYCiXxw.js";
import "./redact-Cx40Dm28.js";
import "./errors-DopTfGpy.js";
import "./fs-safe-oQRM60Ha.js";
import "./proxy-env-561Kv0ja.js";
import "./store-C27BiEyn.js";
import "./paths-xqWXix_o.js";
import "./tool-images-D8fA7TdQ.js";
import "./image-DltW_1Yr.js";
import "./audio-transcription-runner-C4j34sQn.js";
import "./fetch-PoeSt18q.js";
import "./fetch-guard-D1rPO4B_.js";
import "./api-key-rotation-DrHpu8g5.js";
import "./proxy-fetch-53_Tkfsi.js";
import "./ir-xlxNcrQy.js";
import "./render-7C7EDC8_.js";
import "./target-errors-AjeDhjCI.js";
import "./commands-registry-vr4-PUYk.js";
import "./skill-commands-BkZ-7Fga.js";
import "./fetch-CONQGbzL.js";
import "./channel-activity-BoQ6LIGa.js";
import "./tables-B6YmJkD6.js";
import "./send-D5RzKSt1.js";
import "./outbound-attachment-BtZAplOu.js";
import "./send-BRVP4hUT.js";
import "./proxy-BzwL4n0W.js";
import "./manager-BxUv3Br4.js";
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
