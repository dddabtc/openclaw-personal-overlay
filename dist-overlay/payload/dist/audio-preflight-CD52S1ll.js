import "./run-with-concurrency-BXSUl5Nj.js";
import "./paths-GBpjI3o0.js";
import { B as shouldLogVerbose, R as logVerbose } from "./logger-Bj0Xl6pn.js";
import "./model-selection-BlrVqGD5.js";
import "./github-copilot-token-PBo8Vdmp.js";
import "./thinking-D4abO-Mp.js";
import "./plugins-DLRppPYv.js";
import "./accounts-pQsyTPP_.js";
import "./accounts-bddHr5xw.js";
import "./image-ops-DDZd-Pbk.js";
import "./pi-embedded-helpers-BRFDMAwz.js";
import "./chrome-BWg7-GTW.js";
import "./skills-CO6v8UMK.js";
import "./path-alias-guards-6cS80cow.js";
import "./redact-C-grKXb3.js";
import "./errors-IUnFHymY.js";
import "./fs-safe-B9COjfwE.js";
import "./proxy-env-DuZZYydD.js";
import "./store-DTtJuU2-.js";
import "./paths-CV9f-LYb.js";
import "./tool-images-D6TA-pzz.js";
import "./image-BIx5AGj0.js";
import { i as normalizeMediaAttachments, o as resolveMediaAttachmentLocalRoots, t as runAudioTranscription, v as isAudioAttachment } from "./audio-transcription-runner-CjDv1qqv.js";
import "./fetch-D8xpHWCY.js";
import "./fetch-guard-Dqp8XUbB.js";
import "./api-key-rotation-D2Ig-Kl5.js";
import "./proxy-fetch-Cb4oTY_l.js";
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
