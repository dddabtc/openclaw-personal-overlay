import "./run-with-concurrency-8rEOAFIb.js";
import "./config-BzzhfwwZ.js";
import { B as shouldLogVerbose, R as logVerbose } from "./logger-Blr-bUxJ.js";
import "./paths-D6tDENa_.js";
import "./accounts-2nYsK_T0.js";
import "./plugins-lLSwnL0z.js";
import "./thinking-yzWCj-OS.js";
import "./image-ops-BGa3wbFC.js";
import "./pi-embedded-helpers-C9xJeBJh.js";
import "./accounts-By5MJYXC.js";
import "./github-copilot-token-xlpfBCoP.js";
import "./paths-FkFgsZEv.js";
import { i as normalizeMediaAttachments, o as resolveMediaAttachmentLocalRoots, p as isAudioAttachment, t as runAudioTranscription } from "./audio-transcription-runner-iC9W7CrR.js";
import "./image-CQQk8vQg.js";
import "./chrome-DwvJPpGO.js";
import "./skills-B9OK8MDT.js";
import "./path-alias-guards-BRxZnHEh.js";
import "./redact-CvEiyWiO.js";
import "./errors-C3HswBOt.js";
import "./fs-safe-D0d6G8wj.js";
import "./proxy-env-Bm8SAdaK.js";
import "./store-DVW5R-F_.js";
import "./tool-images-CKZrLBfM.js";
import "./fetch-guard-BlFx2zlE.js";
import "./api-key-rotation-Cl7X5ifO.js";
import "./local-roots-BQPwhrJJ.js";
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
