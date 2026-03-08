import { a as logVerbose, c as shouldLogVerbose } from "./globals-Bv4ZcVWM.js";
import "./paths-BfR2LXbA.js";
import "./subsystem-Cf9yS0UI.js";
import "./boolean-DTgd5CzD.js";
import "./auth-profiles-B1GaQT5q.js";
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
import "./pi-embedded-helpers-BB2LNFoT.js";
import "./sandbox-oZkjnD_W.js";
import "./tool-catalog-CFg6jrp9.js";
import "./chrome-BYPs9otD.js";
import "./tailscale-Bxls2k-9.js";
import "./tailnet-D6G15e7J.js";
import "./ws-Z0GdyNOg.js";
import "./auth-DdEjESsp.js";
import "./credentials-BmtdMaC0.js";
import "./resolve-configured-secret-input-string-Cjny1Pmf.js";
import "./server-context-L6JZ3V1F.js";
import "./frontmatter-CDYnjLEC.js";
import "./env-overrides-BeDt30xz.js";
import "./path-alias-guards-a82xwrK5.js";
import "./skills-CGqwYVbO.js";
import "./paths-DELgyEUB.js";
import "./redact-SKlSb-Ph.js";
import "./errors-Duls987w.js";
import "./fs-safe-Dyd9x5R1.js";
import "./proxy-env-DQF_ZEGo.js";
import "./store-XprJI9yK.js";
import "./ports-CTMzENnh.js";
import "./trash-CsUKAlUm.js";
import "./server-middleware-UHVTx4Wc.js";
import "./sessions-KF02xeDF.js";
import "./paths-BCX3TKIK.js";
import "./chat-envelope-B0leI413.js";
import "./tool-images-CnTjIKsB.js";
import "./thinking-DykY2Fzj.js";
import "./models-config-DNwGtD55.js";
import "./model-catalog-CcpxN9xq.js";
import "./fetch-kL7SMj4q.js";
import { i as normalizeMediaAttachments, o as resolveMediaAttachmentLocalRoots, t as runAudioTranscription, y as isAudioAttachment } from "./audio-transcription-runner-D0oDQRpw.js";
import "./fetch-guard-BWFv8lEA.js";
import "./image-DnRuv_Ze.js";
import "./tool-display-B1jaCPlW.js";
import "./api-key-rotation-n3L8KwZo.js";
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
