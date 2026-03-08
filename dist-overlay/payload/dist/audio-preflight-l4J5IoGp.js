import "./agent-scope-DBH4tc6E.js";
import "./paths-C9do7WCN.js";
import { $ as shouldLogVerbose, X as logVerbose } from "./subsystem-DhjIxims.js";
import "./workspace-jH04VzX-.js";
import "./model-selection-w6ucPeWO.js";
import "./github-copilot-token-BkwQAVvU.js";
import "./env-ClJSw9gs.js";
import "./boolean-mcn6kL0s.js";
import "./plugins-C1VUBuby.js";
import "./accounts-CfKX8yG7.js";
import "./bindings-CDK0IrP0.js";
import "./accounts-cHckgn_t.js";
import "./image-ops-BhxPhYFk.js";
import "./pi-model-discovery-C-yOXpma.js";
import "./message-channel-pwZqDIgx.js";
import "./pi-embedded-helpers-CODT0E7X.js";
import "./config-CyPYPMkz.js";
import "./manifest-registry-BT84-RS7.js";
import "./dock-DZ4pzoln.js";
import "./chrome-rb6hLvYL.js";
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
import "./image-f3dYfQiz.js";
import "./gemini-auth-BSk0KCpC.js";
import "./fetch-guard-BYswKNH0.js";
import "./local-roots-BqL3X_i0.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, t as buildProviderRegistry, u as isAudioAttachment } from "./runner-QXd4PaN2.js";

//#region src/media-understanding/audio-preflight.ts
/**
* Transcribes the first audio attachment BEFORE mention checking.
* This allows voice notes to be processed in group chats with requireMention: true.
* Returns the transcript or undefined if transcription fails or no audio is found.
*/
async function transcribeFirstAudio(params) {
	const { ctx, cfg } = params;
	const audioConfig = cfg.tools?.media?.audio;
	if (!audioConfig || audioConfig.enabled === false) return;
	const attachments = normalizeMediaAttachments(ctx);
	if (!attachments || attachments.length === 0) return;
	const firstAudio = attachments.find((att) => att && isAudioAttachment(att) && !att.alreadyTranscribed);
	if (!firstAudio) return;
	if (shouldLogVerbose()) logVerbose(`audio-preflight: transcribing attachment ${firstAudio.index} for mention check`);
	const providerRegistry = buildProviderRegistry(params.providers);
	const cache = createMediaAttachmentCache(attachments, { localPathRoots: resolveMediaAttachmentLocalRoots({
		cfg,
		ctx
	}) });
	try {
		const result = await runCapability({
			capability: "audio",
			cfg,
			ctx,
			attachments: cache,
			media: attachments,
			agentDir: params.agentDir,
			providerRegistry,
			config: audioConfig,
			activeModel: params.activeModel
		});
		if (!result || result.outputs.length === 0) return;
		const audioOutput = result.outputs.find((output) => output.kind === "audio.transcription");
		if (!audioOutput || !audioOutput.text) return;
		firstAudio.alreadyTranscribed = true;
		if (shouldLogVerbose()) logVerbose(`audio-preflight: transcribed ${audioOutput.text.length} chars from attachment ${firstAudio.index}`);
		return audioOutput.text;
	} catch (err) {
		if (shouldLogVerbose()) logVerbose(`audio-preflight: transcription failed: ${String(err)}`);
		return;
	} finally {
		await cache.cleanup();
	}
}

//#endregion
export { transcribeFirstAudio };