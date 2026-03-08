import "./run-with-concurrency-DCb27DCP.js";
import "./paths-B9fwHuf0.js";
import { B as shouldLogVerbose, R as logVerbose } from "./logger-3VRkTvTU.js";
import "./accounts-B99JQzCt.js";
import "./thinking-JHld8Ykf.js";
import "./model-auth-BTPO3sWW.js";
import "./plugins-DXyG_9Uo.js";
import "./accounts-C-E9FB0I.js";
import "./github-copilot-token-B2m7CSyP.js";
import "./ssrf-W-kPGH2e.js";
import "./fetch-guard-WJL5PMnv.js";
import "./message-channel-zg0WyhVM.js";
import "./path-alias-guards-B-ts_bL2.js";
import "./fs-safe-CaqxBI6N.js";
import "./store-ILDCvOLN.js";
import "./local-roots-or0CQV5X.js";
import "./pi-embedded-helpers-BkNc6kBj.js";
import "./paths-DhcZ7U8k.js";
import { i as normalizeMediaAttachments, o as resolveMediaAttachmentLocalRoots, p as isAudioAttachment, t as runAudioTranscription } from "./audio-transcription-runner-BHMN99M1.js";
import "./image-CmmJ8jMk.js";
import "./chrome-CdpbJdj1.js";
import "./skills-BIR3xKpo.js";
import "./redact-CGNZQXaJ.js";
import "./errors-CtjhsMeB.js";
import "./tool-images--ECq8v8J.js";
import "./api-key-rotation-CKffg8Er.js";
import "./proxy-fetch-7j49V0Yz.js";
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
