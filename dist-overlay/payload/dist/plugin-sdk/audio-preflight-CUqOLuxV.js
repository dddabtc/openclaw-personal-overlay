import "./run-with-concurrency-B0lSSjmf.js";
import "./accounts-DY1xeikk.js";
import "./paths-eFexkPEh.js";
import "./github-copilot-token-Cxf8QYZb.js";
import "./config-ByzbifKa.js";
import { B as shouldLogVerbose, R as logVerbose } from "./logger-DnJ6DlYK.js";
import "./thinking-CWWJ2tFy.js";
import "./image-ops-CnGRhMnE.js";
import "./pi-embedded-helpers-t80zA8GQ.js";
import "./plugins-CXCgYPG3.js";
import "./accounts-XKh8_qy1.js";
import "./paths-Bg689P_I.js";
import "./redact-CYYEqr51.js";
import "./errors-CPQaeq5_.js";
import "./path-alias-guards-lWkVroHS.js";
import "./fs-safe-Cw-rxU-z.js";
import "./ssrf-9uwo0NH2.js";
import "./fetch-guard-Bo6qnW_W.js";
import "./local-roots-BCMnlD8F.js";
import "./tool-images-B5jT0gq0.js";
import { i as normalizeMediaAttachments, m as isAudioAttachment, o as resolveMediaAttachmentLocalRoots, t as runAudioTranscription } from "./audio-transcription-runner-DZi7gnbN.js";
import "./image-orfRHauT.js";
import "./chrome-CZ4M_GiV.js";
import "./skills-Ce6t31ww.js";
import "./store-eyczVEOu.js";
import "./api-key-rotation-DnbY2MUx.js";
import "./proxy-fetch-B_Mh34nZ.js";
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
