import "./run-with-concurrency-BMh-rgTO.js";
import "./accounts-DzYla0jG.js";
import "./paths-eFexkPEh.js";
import "./github-copilot-token-Cxf8QYZb.js";
import "./config-BlCFP-Lr.js";
import { B as shouldLogVerbose, R as logVerbose } from "./logger-U3s76KST.js";
import "./thinking-gLNjniYP.js";
import "./image-ops-C55wv2dT.js";
import "./pi-embedded-helpers-BXvraGC7.js";
import "./plugins-CuUAOaQr.js";
import "./accounts-6roLrGze.js";
import "./paths-GZK_LI8c.js";
import "./redact-z6WVaymT.js";
import "./errors-DR1SiaHP.js";
import "./path-alias-guards-XbH-Vt2n.js";
import "./fs-safe-edcds3oU.js";
import "./ssrf-CircopoN.js";
import "./fetch-guard-CvSm0ZFg.js";
import "./local-roots-BhS2eVZj.js";
import "./tool-images-B165fyia.js";
import { i as normalizeMediaAttachments, m as isAudioAttachment, o as resolveMediaAttachmentLocalRoots, t as runAudioTranscription } from "./audio-transcription-runner-B3-MqW76.js";
import "./image-Buc2FhLV.js";
import "./chrome-C3kGWUNO.js";
import "./skills-B_EZDiyD.js";
import "./store-CizArNLR.js";
import "./api-key-rotation-DIq1DMgC.js";
import "./proxy-fetch-0VcTBuoM.js";
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
