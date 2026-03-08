import "./run-with-concurrency-XmKq-xNS.js";
import "./accounts-DKqkBSPx.js";
import "./model-auth-DmbBEYHT.js";
import { B as shouldLogVerbose, R as logVerbose } from "./logger-Cxu-Klb_.js";
import "./paths-akVZbnot.js";
import "./github-copilot-token-CjEwwa4e.js";
import "./thinking-CUhe6_PZ.js";
import "./plugins-CLGkFudl.js";
import "./image-ops-BRtq4DNm.js";
import "./pi-embedded-helpers-DjSnOIZ0.js";
import "./accounts-Drg-o0Pb.js";
import "./paths-D8Z6gklo.js";
import { i as normalizeMediaAttachments, o as resolveMediaAttachmentLocalRoots, p as isAudioAttachment, t as runAudioTranscription } from "./audio-transcription-runner-CUAu-OuH.js";
import "./image-D14b17K1.js";
import "./chrome-G9RBf1jM.js";
import "./skills-DY5D-Jxv.js";
import "./path-alias-guards-CVixGQ86.js";
import "./redact-BLCBOszJ.js";
import "./errors-ClHdc6fp.js";
import "./fs-safe-hj1IvA_7.js";
import "./proxy-env-DpfyR0L4.js";
import "./store-9P4E9e5L.js";
import "./tool-images-CHFVBTL_.js";
import "./fetch-guard-BcAHWqSH.js";
import "./api-key-rotation-C3mujW4X.js";
import "./local-roots-fT6N89h0.js";
import "./proxy-fetch-o2k_1EOm.js";
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
	try {
		const { transcript } = await runAudioTranscription({
			ctx,
			cfg,
			attachments,
			agentDir: params.agentDir,
			providers: params.providers,
			activeModel: params.activeModel,
			localPathRoots: resolveMediaAttachmentLocalRoots({
				cfg,
				ctx
			})
		});
		if (!transcript) return;
		firstAudio.alreadyTranscribed = true;
		if (shouldLogVerbose()) logVerbose(`audio-preflight: transcribed ${transcript.length} chars from attachment ${firstAudio.index}`);
		return transcript;
	} catch (err) {
		if (shouldLogVerbose()) logVerbose(`audio-preflight: transcription failed: ${String(err)}`);
		return;
	}
}
//#endregion
export { transcribeFirstAudio };
