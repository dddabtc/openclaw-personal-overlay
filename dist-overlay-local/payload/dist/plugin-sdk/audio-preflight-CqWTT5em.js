import "./accounts-B4AwEIkX.js";
import "./paths-DVWx7USN.js";
import "./github-copilot-token-Cg0YPPSu.js";
import "./plugins-DibeMwuf.js";
import { K as logVerbose, Y as shouldLogVerbose } from "./registry-BODM0liu.js";
import "./config-Dmuf-X_8.js";
import "./subsystem-CcWTQzT4.js";
import "./command-format-DlCJ6Vf_.js";
import "./model-selection-Jdj95NV3.js";
import "./agent-scope-Xg97m-eH.js";
import "./manifest-registry-BKc0Ujlf.js";
import "./redact-DPnDWsnT.js";
import "./errors-Bv8oZiTO.js";
import "./image-ops-C-FmeLM-.js";
import "./ssrf-DKZ8eBrk.js";
import "./local-roots-ClrRhF7x.js";
import "./message-channel-CUaOB1wh.js";
import "./bindings-DEVKMeKf.js";
import "./tool-images-KxE68Cxp.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, t as buildProviderRegistry, u as isAudioAttachment } from "./runner-CbG6NBVY.js";
import "./skills-DHgtld9F.js";
import "./chrome-CLChZob_.js";
import "./thinking-CT0vXDJs.js";
import "./accounts-Ca1fjBtk.js";
import "./accounts-RCIdUtOX.js";
import "./pi-embedded-helpers-aNm_u1_g.js";
import "./paths-BNQjLbn7.js";
import "./store-DGNHfylD.js";
import "./image-D9cm87J0.js";
import "./pi-model-discovery-LbcEa65a.js";
import "./api-key-rotation-Ch8n0bhu.js";

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