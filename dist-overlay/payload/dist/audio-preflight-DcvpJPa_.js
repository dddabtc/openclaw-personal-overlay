import "./run-with-concurrency-Cuc1THN9.js";
import "./paths-hfkBoC7i.js";
import { d as logVerbose, m as shouldLogVerbose } from "./subsystem-C-Cf_MFK.js";
import "./workspace-CaW79EXh.js";
import "./logger-BW8uLq6f.js";
import "./model-selection-BU6wl1le.js";
import "./github-copilot-token-CQmATy5E.js";
import "./legacy-names-BAf61_0I.js";
import "./thinking-B5B36ffe.js";
import "./plugins-BZr8LJrk.js";
import "./accounts-D4KOSoV2.js";
import "./accounts-cJqOTvBI.js";
import "./image-ops-D4vlUR_L.js";
import "./pi-embedded-helpers-CkWXaNFn.js";
import "./chrome-u1QjWgKY.js";
import "./frontmatter-CZF6xkL3.js";
import "./skills-B24U0XQQ.js";
import "./path-alias-guards-CouH80Zp.js";
import "./redact-DSv8X-3F.js";
import "./errors-_LEe37ld.js";
import "./fs-safe-DOYVoR6M.js";
import "./proxy-env-BZseFuIl.js";
import "./store-BteyapSQ.js";
import "./paths-Co-u8IhA.js";
import "./tool-images-C0W994KU.js";
import "./image-fMgabouP.js";
import { i as normalizeMediaAttachments, o as resolveMediaAttachmentLocalRoots, t as runAudioTranscription, v as isAudioAttachment } from "./audio-transcription-runner-DfRfzdqH.js";
import "./fetch-JzejSI-7.js";
import "./fetch-guard-C3LWD6FT.js";
import "./api-key-rotation-CLI6TxVv.js";
import "./proxy-fetch-CbII9--S.js";
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
