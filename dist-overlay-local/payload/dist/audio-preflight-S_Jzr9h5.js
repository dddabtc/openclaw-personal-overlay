import "./paths-Bp5uKvNR.js";
import { K as logVerbose, Y as shouldLogVerbose } from "./registry-dD2_jBuv.js";
import "./agent-scope-BwpIA8AB.js";
import "./subsystem-CGx2ESmP.js";
import "./model-selection-D21G6-RX.js";
import "./github-copilot-token-ttqQRqMA.js";
import "./env-MtDjQbRJ.js";
import "./plugins-B15qlrXp.js";
import "./accounts-B7JHFO05.js";
import "./bindings-CouyEDd-.js";
import "./accounts-Bbrx4iEQ.js";
import "./image-ops-CK3EyTQS.js";
import "./pi-model-discovery-j5tVLINv.js";
import "./message-channel-On7Q-_2D.js";
import "./pi-embedded-helpers-Vt3mTYPQ.js";
import "./config-C3X0bZVI.js";
import "./manifest-registry-DOlyZDjG.js";
import "./chrome-Nr8bIIfc.js";
import "./skills-DGte8gjC.js";
import "./redact-1NGYV_8p.js";
import "./errors-CPfngF0S.js";
import "./ssrf-CxfFyMRZ.js";
import "./store-DFTgk03B.js";
import "./thinking-C0rsVu42.js";
import "./accounts-fsYgfUsB.js";
import "./paths-5iQF9bSz.js";
import "./tool-images-B7QCXVMD.js";
import "./image-L-DTdNIr.js";
import "./gemini-auth-C10_caMf.js";
import "./local-roots-CkICMIko.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, t as buildProviderRegistry, u as isAudioAttachment } from "./runner-D7tJ_iFf.js";

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