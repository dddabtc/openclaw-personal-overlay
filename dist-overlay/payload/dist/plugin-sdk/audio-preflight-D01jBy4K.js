import "./run-with-concurrency-8rEOAFIb.js";
import "./config-Di-lyCdh.js";
import { B as shouldLogVerbose, R as logVerbose } from "./logger-Blr-bUxJ.js";
import "./paths-D6tDENa_.js";
import "./accounts-fYmDJQ05.js";
import "./plugins-Bv1h7dAV.js";
import "./thinking-CopbP_Cn.js";
import "./image-ops-DShUnGTj.js";
import "./pi-embedded-helpers-CY7PsNpl.js";
import "./accounts-v98MfcUX.js";
import "./github-copilot-token-xlpfBCoP.js";
import "./paths-FkFgsZEv.js";
import { i as normalizeMediaAttachments, o as resolveMediaAttachmentLocalRoots, p as isAudioAttachment, t as runAudioTranscription } from "./audio-transcription-runner-BRykE3qr.js";
import "./image-GobYx2eE.js";
import "./chrome-D8oVqHh2.js";
import "./skills-D6d12I2d.js";
import "./path-alias-guards-BRxZnHEh.js";
import "./redact-CvEiyWiO.js";
import "./errors-C3HswBOt.js";
import "./fs-safe-D0d6G8wj.js";
import "./proxy-env-CA0GzWTW.js";
import "./store-mtTuyXse.js";
import "./tool-images-B_O56K5-.js";
import "./fetch-guard-CyKab9WW.js";
import "./api-key-rotation-CH_-Q5pn.js";
import "./local-roots-s2I07jZe.js";
import "./proxy-fetch-CeRC7OhU.js";
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
