import "./accounts-CkURcCwV.js";
import "./paths-DVWx7USN.js";
import "./github-copilot-token-Cg0YPPSu.js";
import "./config-mFX4iXuS.js";
import { $ as logVerbose, nt as shouldLogVerbose } from "./subsystem-wfAzEN3T.js";
import "./command-format-CL9J-e-o.js";
import "./model-selection-DIuDAWoy.js";
import "./agent-scope-LnIU4huW.js";
import "./manifest-registry-BdyBhdiw.js";
import "./dock-XEJVaf9s.js";
import "./message-channel-ChanO1hm.js";
import "./sessions-np3z_WgA.js";
import "./plugins-DYE0rCH8.js";
import "./accounts-BeC_vdBH.js";
import "./accounts-C5sly8wN.js";
import "./bindings-B4ev3j7i.js";
import "./paths-DcieI7Jk.js";
import "./redact-bRhzRK8V.js";
import "./errors-DNMNty8O.js";
import "./fs-safe-Dd-u-yj0.js";
import "./image-ops-DkUrLYnc.js";
import "./ssrf-C8mJOpz5.js";
import "./fetch-guard-2oY0g5rK.js";
import "./local-roots-CpK_t8kV.js";
import "./tool-images-yEhdNnT1.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, t as buildProviderRegistry, u as isAudioAttachment } from "./runner-CqhQorN3.js";
import "./skills-wKM1hVlb.js";
import "./chrome-6ThWGET7.js";
import "./store-DoxZR3fS.js";
import "./pi-embedded-helpers-Cw0k0qaO.js";
import "./thinking-C9dOVGlX.js";
import "./image-DJBgq6XZ.js";
import "./pi-model-discovery-CFapGP7O.js";
import "./api-key-rotation-Cn0ZOfDR.js";

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