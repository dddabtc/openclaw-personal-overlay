import "./run-with-concurrency-B0Wb-l36.js";
import "./model-auth-CkGNanzp.js";
import { B as shouldLogVerbose, R as logVerbose } from "./logger-Cxu-Klb_.js";
import "./paths-akVZbnot.js";
import "./github-copilot-token-CjEwwa4e.js";
import "./thinking-Cc1GrwLO.js";
import "./accounts-B9DYQQ8S.js";
import "./plugins-BCZJyaK6.js";
import "./ssrf-rEz6Utw1.js";
import "./fetch-guard-CwPy8FTx.js";
import "./image-ops-BhMjbl6B.js";
import "./pi-embedded-helpers-C3R9yTmI.js";
import "./accounts-BdRXhfdX.js";
import "./paths-CNBdcyu4.js";
import { i as normalizeMediaAttachments, o as resolveMediaAttachmentLocalRoots, p as isAudioAttachment, t as runAudioTranscription } from "./audio-transcription-runner-Ct9D-6-d.js";
import "./image-BqoYytqX.js";
import "./chrome-MKkzVzI0.js";
import "./skills-DtcUcPWB.js";
import "./path-alias-guards-4pesaMWH.js";
import "./redact-BkCa6pJx.js";
import "./errors-DAKeCDdf.js";
import "./fs-safe-DD7dvC_x.js";
import "./store-B-nHAoqN.js";
import "./tool-images-HdQSENXg.js";
import "./api-key-rotation-C8K71UU8.js";
import "./local-roots-CpTlgVcQ.js";
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
