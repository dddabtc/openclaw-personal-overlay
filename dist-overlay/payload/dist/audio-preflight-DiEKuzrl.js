import { a as logVerbose, c as shouldLogVerbose } from "./globals-Bv4ZcVWM.js";
import "./paths-BfR2LXbA.js";
import "./subsystem-Cf9yS0UI.js";
import "./boolean-DTgd5CzD.js";
import "./auth-profiles-5CHn7vq1.js";
import "./agent-scope-DF-nzI8H.js";
import "./utils-C5WN6czr.js";
import "./openclaw-root-DFJGXT24.js";
import "./logger-DUUyiuLB.js";
import "./exec-ByKs6PmP.js";
import "./github-copilot-token-CcBrBN3h.js";
import "./host-env-security-blJbxyQo.js";
import "./version-Bxx5bg6l.js";
import "./registry-DoLLbW4m.js";
import "./manifest-registry-Ba187z7Z.js";
import "./dock-BgGWFqHm.js";
import "./plugins-BkoiCBu-.js";
import "./accounts-LPEl32gb.js";
import "./channel-config-helpers-BDId9EPL.js";
import "./accounts-_PYzdhne.js";
import "./image-ops-CQrO7d64.js";
import "./message-channel-Be-gqLbb.js";
import "./pi-embedded-helpers-B7bn2aDM.js";
import "./sandbox-BTeDGNMJ.js";
import "./tool-catalog-CFg6jrp9.js";
import "./chrome-DmtcwLP7.js";
import "./tailscale-Bxls2k-9.js";
import "./tailnet-BuB4hnEo.js";
import "./ws-Bjkel2eG.js";
import "./auth-DgIL-BOU.js";
import "./credentials-C5dZtBqt.js";
import "./resolve-configured-secret-input-string-BGiZkpTb.js";
import "./server-context-BP-G8-mB.js";
import "./frontmatter-CDYnjLEC.js";
import "./env-overrides-BeDt30xz.js";
import "./path-alias-guards-D_v2YTP8.js";
import "./skills-B3eXdmA5.js";
import "./paths-DBHbY8ck.js";
import "./redact-SKlSb-Ph.js";
import "./errors-Duls987w.js";
import "./fs-safe-n_u5Hqlt.js";
import "./proxy-env-B1SW3C2U.js";
import "./store-kjkrRAMQ.js";
import "./ports-DOBLq-G-.js";
import "./trash-CsUKAlUm.js";
import "./server-middleware-C6_5AADb.js";
import "./sessions-DVRA-cO-.js";
import "./paths-BCX3TKIK.js";
import "./chat-envelope-B0leI413.js";
import "./tool-images-BnvE1YX0.js";
import "./thinking-DykY2Fzj.js";
import "./models-config-DXA5BkaM.js";
import "./model-catalog-Ezhj-HLy.js";
import "./fetch-CvdHkSxZ.js";
import { i as normalizeMediaAttachments, o as resolveMediaAttachmentLocalRoots, t as runAudioTranscription, y as isAudioAttachment } from "./audio-transcription-runner-DPzqXt3G.js";
import "./fetch-guard-DpKgluWH.js";
import "./image-BCVX7urs.js";
import "./tool-display-B1jaCPlW.js";
import "./api-key-rotation-BCo2Kocu.js";
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
