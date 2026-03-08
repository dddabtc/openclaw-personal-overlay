import "./paths-BJV7vkaX.js";
import { a as logVerbose, c as shouldLogVerbose } from "./globals-BM8hKFm0.js";
import "./utils-DC4zYvW0.js";
import "./thinking-BYwvlJ3S.js";
import "./agent-scope-Cbp0nOOm.js";
import "./subsystem-C9Xgeyrw.js";
import "./openclaw-root-D1FcrxOp.js";
import "./logger-BKkZU9TX.js";
import "./exec-nuW3NMJe.js";
import "./model-selection-Dnp6qsMS.js";
import "./github-copilot-token-BQoM_VEX.js";
import "./boolean-D8Ha5nYV.js";
import "./env-ByppU_6u.js";
import "./host-env-security-CbFV1gAw.js";
import "./registry-DGVIIthr.js";
import "./manifest-registry-BMEqbkWA.js";
import "./dock-BvmTvlyF.js";
import "./message-channel-DMsTX_8C.js";
import "./plugins-t3ljVB7c.js";
import "./sessions-BHlTfQrB.js";
import { d as isAudioAttachment, i as normalizeMediaAttachments, o as resolveMediaAttachmentLocalRoots, t as runAudioTranscription } from "./audio-transcription-runner-CjTRQAYD.js";
import "./image-NbYNBJiC.js";
import "./models-config-CcINSmzx.js";
import "./pi-embedded-helpers-DpxiOWc7.js";
import "./sandbox-B1b0M7aa.js";
import "./tool-catalog-DE9Q8xiB.js";
import "./chrome-D_5F1fTz.js";
import "./tailscale-DrDx-3cv.js";
import "./tailnet-aR1njljD.js";
import "./ws-CyLniShb.js";
import "./auth-B_hse2QY.js";
import "./credentials-BXh0SH4r.js";
import "./resolve-configured-secret-input-string-nrn5ht8y.js";
import "./server-context-WOo_YXiZ.js";
import "./frontmatter-BvLOP38b.js";
import "./env-overrides-Cam0mPAe.js";
import "./path-alias-guards-BxTM8fFt.js";
import "./skills-C5yXLr4m.js";
import "./paths-TP02AE1K.js";
import "./redact-XVjLULTG.js";
import "./errors-Dl9nRyXH.js";
import "./fs-safe-BFrSJTKP.js";
import "./proxy-env-y8VkOmV-.js";
import "./image-ops-v9o00YrC.js";
import "./store-CCWPL_3R.js";
import "./ports-CZeJLe7P.js";
import "./trash-R64jHFGe.js";
import "./server-middleware-BoAIUz5k.js";
import "./accounts-WRgl0tJ1.js";
import "./channel-config-helpers-BnsIklFT.js";
import "./accounts-BtlgULZC.js";
import "./paths-BWOXmNIW.js";
import "./chat-envelope-BkySjpPY.js";
import "./tool-images-DSp1Kkra.js";
import "./tool-display-ILkHoY2-.js";
import "./fetch-guard-D5xn4qz4.js";
import "./api-key-rotation-DbI8BtU3.js";
import "./local-roots-Bnjiu4vQ.js";
import "./model-catalog-ALoJUL06.js";
import "./proxy-fetch-DuABaQ_5.js";
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
