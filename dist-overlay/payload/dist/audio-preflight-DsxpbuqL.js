import { Ct as shouldLogVerbose, bt as logVerbose } from "./entry.js";
import "./auth-profiles-VHiPC1-T.js";
import "./agent-scope-DhI_kPU3.js";
import "./exec-TIZD7ZZn.js";
import "./github-copilot-token-DKRiM6oj.js";
import "./host-env-security-DyQuUnEd.js";
import "./pi-model-discovery-CwESh4K1.js";
import "./frontmatter-17nP3KZr.js";
import "./skills-M3ShrlYm.js";
import "./manifest-registry-BgY5xgMH.js";
import "./config-CaJqgOvf.js";
import "./env-vars-iFkEK4MO.js";
import "./dock-D4HTBK6f.js";
import "./message-channel-CIQTys4Q.js";
import "./sessions-r0eCG3qK.js";
import "./plugins-DS5tNvig.js";
import "./accounts-Q2sI0yx1.js";
import "./accounts-DTV7qtJm.js";
import "./accounts-Bgj4wZaj.js";
import "./bindings-BJckG653.js";
import "./logging-CFvkxgcX.js";
import "./paths-DDT5WL2f.js";
import "./chat-envelope-BG_U_muK.js";
import "./net-C5Xzxz5G.js";
import "./ip-CyOZe5YF.js";
import "./tailnet-CC0kbSg4.js";
import "./image-ops-BtM0q_Kl.js";
import "./pi-embedded-helpers-BaqEyMdl.js";
import "./sandbox-OR4o76Qx.js";
import "./tool-catalog-BS-Gk_Yg.js";
import "./chrome-DoHC6NEx.js";
import "./tailscale-BIikm3VQ.js";
import "./auth-uSllFIea.js";
import "./server-context-CWN_iNA_.js";
import "./redact-Dcypez3H.js";
import "./errors-Cu3BYw29.js";
import "./fs-safe-Cwp1VOPx.js";
import "./paths-Dm4w47Dx.js";
import "./ssrf-D2dYwtfF.js";
import "./store-BnzosEtE.js";
import "./ports-DcKmwJ_3.js";
import "./trash-BqYFVJft.js";
import "./server-middleware-CjPPadc3.js";
import "./tool-images-DCL9xDRg.js";
import "./thinking-Ds3Ekf1K.js";
import "./models-config-BKCiBHJZ.js";
import "./gemini-auth-Bym9uufz.js";
import "./fetch-guard-CozZxo_V.js";
import "./local-roots-CtEMMzoM.js";
import "./image-Be-lKO02.js";
import "./tool-display-BjKWYkZ_.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, s as isAudioAttachment, t as buildProviderRegistry } from "./runner-D3O98nXv.js";
import "./model-catalog-CxrBTiUJ.js";

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
	const providerRegistry = buildProviderRegistry(params.providers);
	const cache = createMediaAttachmentCache(attachments, { localPathRoots: resolveMediaAttachmentLocalRoots({
		cfg,
		ctx
	}) });
	try {
		const result = await runCapability({
			capability: "audio",
			cfg,
			ctx,
			attachments: cache,
			media: attachments,
			agentDir: params.agentDir,
			providerRegistry,
			config: audioConfig,
			activeModel: params.activeModel
		});
		if (!result || result.outputs.length === 0) return;
		const audioOutput = result.outputs.find((output) => output.kind === "audio.transcription");
		if (!audioOutput || !audioOutput.text) return;
		firstAudio.alreadyTranscribed = true;
		if (shouldLogVerbose()) logVerbose(`audio-preflight: transcribed ${audioOutput.text.length} chars from attachment ${firstAudio.index}`);
		return audioOutput.text;
	} catch (err) {
		if (shouldLogVerbose()) logVerbose(`audio-preflight: transcription failed: ${String(err)}`);
		return;
	} finally {
		await cache.cleanup();
	}
}

//#endregion
export { transcribeFirstAudio };