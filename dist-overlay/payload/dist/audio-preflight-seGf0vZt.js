import "./run-with-concurrency-BXSUl5Nj.js";
import "./paths-GBpjI3o0.js";
import { B as shouldLogVerbose, R as logVerbose } from "./logger-Bj0Xl6pn.js";
import "./model-selection-BGlGpPgM.js";
import "./github-copilot-token-PBo8Vdmp.js";
import "./thinking-CAzdgmNV.js";
import "./plugins-BRqcq5KJ.js";
import "./accounts-gh0ATxJE.js";
import "./accounts-BRvCEwv5.js";
import "./image-ops-BiRyNW91.js";
import "./pi-embedded-helpers-DLLQ3MsR.js";
import "./chrome-6b8Lcwf6.js";
import "./skills-DBpct2ZG.js";
import "./path-alias-guards-6cS80cow.js";
import "./redact-C-grKXb3.js";
import "./errors-IUnFHymY.js";
import "./fs-safe-B9COjfwE.js";
import "./proxy-env-BQ6DMBcX.js";
import "./store-BZJX4yEa.js";
import "./paths-CV9f-LYb.js";
import "./tool-images-ZMgzxwOg.js";
import "./image-u5AOhmHp.js";
import { i as normalizeMediaAttachments, o as resolveMediaAttachmentLocalRoots, t as runAudioTranscription, v as isAudioAttachment } from "./audio-transcription-runner-DldZwQqa.js";
import "./fetch-SGnigJkV.js";
import "./fetch-guard-Di7yTGlW.js";
import "./api-key-rotation-CIoXuldY.js";
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
