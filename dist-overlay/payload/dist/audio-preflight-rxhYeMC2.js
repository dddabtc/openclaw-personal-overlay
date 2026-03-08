import { a as logVerbose, c as shouldLogVerbose } from "./globals-Bv4ZcVWM.js";
import "./paths-BfR2LXbA.js";
import "./subsystem-Cf9yS0UI.js";
import "./boolean-DTgd5CzD.js";
import "./auth-profiles-D6r73dBV.js";
import "./agent-scope-Da1EU5GK.js";
import "./utils-C5WN6czr.js";
import "./openclaw-root-CUd_d2ed.js";
import "./logger-DUUyiuLB.js";
import "./exec-ByKs6PmP.js";
import "./github-copilot-token-CcBrBN3h.js";
import "./host-env-security-blJbxyQo.js";
import "./version-Bxx5bg6l.js";
import "./registry-DoLLbW4m.js";
import "./manifest-registry-CuX_zqg5.js";
import "./dock-B6YZ_Gqv.js";
import "./plugins-BVlyTb8F.js";
import "./accounts-BwOHHQBZ.js";
import "./channel-config-helpers-CsB6X81V.js";
import "./accounts-araUYuXY.js";
import "./image-ops-DKf0L-bN.js";
import "./message-channel-Be-gqLbb.js";
import "./pi-embedded-helpers-C4ix-hp8.js";
import "./sandbox-DOMl4h_t.js";
import "./tool-catalog-CFg6jrp9.js";
import "./chrome-Dg_bOpEm.js";
import "./tailscale-Bxls2k-9.js";
import "./tailnet-Cw5P8QcH.js";
import "./ws-D5Iy1RWM.js";
import "./auth--ay9gpm5.js";
import "./credentials-C1NEYRqY.js";
import "./resolve-configured-secret-input-string-B5ySloY0.js";
import "./server-context-n4lVlkbM.js";
import "./frontmatter-CDYnjLEC.js";
import "./env-overrides-BeDt30xz.js";
import "./path-alias-guards-a82xwrK5.js";
import "./skills-CGqwYVbO.js";
import "./paths-DELgyEUB.js";
import "./redact-SKlSb-Ph.js";
import "./errors-Duls987w.js";
import "./fs-safe-Dyd9x5R1.js";
import "./proxy-env-CEo90XCC.js";
import "./store-XprJI9yK.js";
import "./ports-CTMzENnh.js";
import "./trash-CsUKAlUm.js";
import "./server-middleware-CL0tGa0R.js";
import "./sessions-DT6AYWRn.js";
import "./paths-BCX3TKIK.js";
import "./chat-envelope-B0leI413.js";
import "./tool-images-CnTjIKsB.js";
import "./thinking-DykY2Fzj.js";
import "./models-config-BV1AjiaC.js";
import "./model-catalog-BDt4wryO.js";
import "./fetch-BHj_GKIz.js";
import { i as normalizeMediaAttachments, o as resolveMediaAttachmentLocalRoots, t as runAudioTranscription, y as isAudioAttachment } from "./audio-transcription-runner-BeCyq-4G.js";
import "./fetch-guard-CFH9UEP7.js";
import "./image-B-D7TDrX.js";
import "./tool-display-B1jaCPlW.js";
import "./api-key-rotation-DVhX-NeS.js";
import "./proxy-fetch-4FkZfomC.js";
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
