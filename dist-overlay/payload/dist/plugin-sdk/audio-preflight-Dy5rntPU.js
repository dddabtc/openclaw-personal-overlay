import "./run-with-concurrency-B0Wb-l36.js";
import "./model-auth-D4ecTvlE.js";
import { B as shouldLogVerbose, R as logVerbose } from "./logger-Cxu-Klb_.js";
import "./paths-akVZbnot.js";
import "./github-copilot-token-CjEwwa4e.js";
import "./thinking-BpMUYZm8.js";
import "./accounts-DaJVK4X2.js";
import "./plugins-eresrA9S.js";
import "./ssrf-BnbQtniE.js";
import "./fetch-guard-RY1NgXp5.js";
import "./image-ops-O570vFfZ.js";
import "./pi-embedded-helpers-DQtNbwio.js";
import "./accounts-WTHr094-.js";
import "./paths-CNBdcyu4.js";
import { i as normalizeMediaAttachments, o as resolveMediaAttachmentLocalRoots, p as isAudioAttachment, t as runAudioTranscription } from "./audio-transcription-runner-HEiluesH.js";
import "./image-B6-QeU20.js";
import "./chrome-PCXYI4Bd.js";
import "./skills-DFXxVhcK.js";
import "./path-alias-guards-4pesaMWH.js";
import "./redact-BkCa6pJx.js";
import "./errors-DAKeCDdf.js";
import "./fs-safe-DD7dvC_x.js";
import "./store-DuiaCA3f.js";
import "./tool-images-CAc-ou0x.js";
import "./api-key-rotation-DCAmsQjD.js";
import "./local-roots-DbrRGUnT.js";
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
