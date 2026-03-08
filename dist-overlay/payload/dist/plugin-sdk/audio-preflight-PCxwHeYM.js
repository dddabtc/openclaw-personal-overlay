import "./run-with-concurrency-DH630Ofd.js";
import "./config-DVSRwvvI.js";
import { B as shouldLogVerbose, R as logVerbose } from "./logger-CyvuRp4f.js";
import "./paths-D6tDENa_.js";
import "./accounts-dILr6zQ1.js";
import "./plugins-Dy7SueOJ.js";
import "./thinking-QQPrhQSy.js";
import "./image-ops-RoGKvv-z.js";
import "./pi-embedded-helpers-ng3ucn69.js";
import "./accounts-Y8CBCytU.js";
import "./github-copilot-token-xlpfBCoP.js";
import "./paths-DWzRDjZI.js";
import { i as normalizeMediaAttachments, o as resolveMediaAttachmentLocalRoots, p as isAudioAttachment, t as runAudioTranscription } from "./audio-transcription-runner-C7mAI0Q8.js";
import "./image-EkrHZ0qN.js";
import "./chrome-D4jsmykk.js";
import "./skills-B_D0Wpwv.js";
import "./path-alias-guards-KBvN5BHR.js";
import "./redact-awg-7qvC.js";
import "./errors-BjIqm4lq.js";
import "./fs-safe-BOSNL1Hu.js";
import "./proxy-env-Bk3b81Iy.js";
import "./store-BDa9HHHO.js";
import "./tool-images-SytYRFQW.js";
import "./fetch-guard-CrazK8ue.js";
import "./api-key-rotation-Cyj5kpwk.js";
import "./local-roots-uXly8Wqh.js";
import "./proxy-fetch-BPy37MWG.js";
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
