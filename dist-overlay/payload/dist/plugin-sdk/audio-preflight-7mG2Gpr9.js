import "./run-with-concurrency-BMh-rgTO.js";
import "./accounts-B2lcx0zq.js";
import "./paths-eFexkPEh.js";
import "./github-copilot-token-Cxf8QYZb.js";
import "./config-4Fgm-yEH.js";
import { B as shouldLogVerbose, R as logVerbose } from "./logger-U3s76KST.js";
import "./thinking-pTdxk2dr.js";
import "./image-ops-Btrr1yIZ.js";
import "./pi-embedded-helpers-Dira0ZRW.js";
import "./plugins-9StwNWx8.js";
import "./accounts-BhH0Zhb4.js";
import "./paths-GZK_LI8c.js";
import "./redact-z6WVaymT.js";
import "./errors-DR1SiaHP.js";
import "./path-alias-guards-XbH-Vt2n.js";
import "./fs-safe-edcds3oU.js";
import "./ssrf-D5Fmnfel.js";
import "./fetch-guard-xQKSiLEQ.js";
import "./local-roots-Qhr9gsRI.js";
import "./tool-images-DJFDobje.js";
import { i as normalizeMediaAttachments, m as isAudioAttachment, o as resolveMediaAttachmentLocalRoots, t as runAudioTranscription } from "./audio-transcription-runner-DDBSv70C.js";
import "./image-sUXMwrTj.js";
import "./chrome-BH21wuA9.js";
import "./skills-CFL3C6o8.js";
import "./store-DCApfAUX.js";
import "./api-key-rotation-DujDQz6N.js";
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
