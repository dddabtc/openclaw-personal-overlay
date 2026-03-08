import "./message-channel-DsEYaMZb.js";
import { B as shouldLogVerbose, R as logVerbose } from "./utils-B0IyLNx9.js";
import "./paths-Dmn791zP.js";
import "./tool-images-BIF_S_E2.js";
import "./run-with-concurrency-DskKz1MS.js";
import "./plugins-Bs52fipV.js";
import "./accounts-BLrXTtBs.js";
import "./model-auth-BqMdvYaY.js";
import "./github-copilot-token-B_Z-mAek.js";
import "./thinking-akFszYBQ.js";
import "./ssrf-C2vaZZS8.js";
import "./fetch-guard-DAo1tR6w.js";
import "./pi-embedded-helpers-DWd7Q2-V.js";
import "./accounts-BwbdI0xO.js";
import "./paths-Bet0bgXF.js";
import { i as normalizeMediaAttachments, o as resolveMediaAttachmentLocalRoots, p as isAudioAttachment, t as runAudioTranscription } from "./audio-transcription-runner-CdOzl851.js";
import "./image-CcC0_JBO.js";
import "./chrome-meJfeZv2.js";
import "./skills-NzLRE02l.js";
import "./path-alias-guards-DME1fctW.js";
import "./redact-CzWQJedj.js";
import "./errors-BB_karnD.js";
import "./fs-safe-Bmf0Dn_8.js";
import "./store-Bi6NxCWi.js";
import "./api-key-rotation-XaBj4_TQ.js";
import "./local-roots-Dekb7i1s.js";
import "./proxy-fetch-BKb1uyZt.js";
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
