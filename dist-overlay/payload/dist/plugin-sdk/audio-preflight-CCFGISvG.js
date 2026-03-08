import "./run-with-concurrency-D4zr_gVN.js";
import "./model-auth-DVyo6JSX.js";
import { B as shouldLogVerbose, R as logVerbose } from "./logger-By5InJr-.js";
import "./paths-akVZbnot.js";
import "./github-copilot-token-CjEwwa4e.js";
import "./thinking-WXqkGljb.js";
import "./accounts-B9P-0QnH.js";
import "./plugins-BN3cYRe_.js";
import "./ssrf-CL_1mpll.js";
import "./fetch-guard-CCw4QC7O.js";
import "./image-ops-DbjpKo-Z.js";
import "./pi-embedded-helpers-B89Z8pGU.js";
import "./accounts-A0axM_cU.js";
import "./paths-wdpUnOi3.js";
import { i as normalizeMediaAttachments, o as resolveMediaAttachmentLocalRoots, p as isAudioAttachment, t as runAudioTranscription } from "./audio-transcription-runner-BKRoAe2_.js";
import "./image-DWTI1M2u.js";
import "./chrome-OKSeMchV.js";
import "./skills-Cg6L74m-.js";
import "./path-alias-guards-BwvPS3OP.js";
import "./redact-DWoRn2Tq.js";
import "./errors-Xqkv9YQM.js";
import "./fs-safe-BFoQ32F4.js";
import "./store-DV9uDJiF.js";
import "./tool-images-C7SInCov.js";
import "./api-key-rotation-DfYDdCvI.js";
import "./local-roots-BdwneKW-.js";
import "./proxy-fetch-UbW7MAtn.js";
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
