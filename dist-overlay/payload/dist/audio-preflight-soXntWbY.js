import "./run-with-concurrency-Dz4ZBsiB.js";
import "./paths-DkxwiA8g.js";
import { d as logVerbose, m as shouldLogVerbose } from "./subsystem-C9Gk4AAH.js";
import "./workspace-N-w3YxwR.js";
import "./logger-CJbXRTpA.js";
import "./model-selection-BPSJNV1m.js";
import "./github-copilot-token-8N63GdbE.js";
import "./legacy-names-dyOVyQ4G.js";
import "./thinking-CeokMk4d.js";
import "./plugins-DziabxS9.js";
import "./accounts-N-kltVGR.js";
import "./accounts-BKYCbdnh.js";
import "./image-ops-CgbthA1d.js";
import "./pi-embedded-helpers-UBvLlZ4y.js";
import "./chrome-CJkW-A2q.js";
import "./frontmatter-DR8lvaM9.js";
import "./skills-CXtBlvSl.js";
import "./path-alias-guards-DGYCiXxw.js";
import "./redact-Cx40Dm28.js";
import "./errors-DopTfGpy.js";
import "./fs-safe-oQRM60Ha.js";
import "./proxy-env-CKMZMH7P.js";
import "./store-C2MCa3R9.js";
import "./paths-xqWXix_o.js";
import "./tool-images-C7WBa8bh.js";
import "./image-DUdnUxSL.js";
import { i as normalizeMediaAttachments, o as resolveMediaAttachmentLocalRoots, t as runAudioTranscription, v as isAudioAttachment } from "./audio-transcription-runner-Cgui9HIY.js";
import "./fetch-BOsAhlie.js";
import "./fetch-guard-DUaK4800.js";
import "./api-key-rotation-UUPMd7AY.js";
import "./proxy-fetch-53_Tkfsi.js";
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
