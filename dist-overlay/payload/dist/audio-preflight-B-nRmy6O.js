import "./paths-B4BZAPZh.js";
import { F as shouldLogVerbose, M as logVerbose } from "./utils-BvKkAKT3.js";
import "./thinking-EAliFiVK.js";
import "./agent-scope-D8gw-U5c.js";
import "./subsystem-Bqlcd6-a.js";
import "./exec-CAIB93jD.js";
import "./model-selection-BnthIvhe.js";
import "./github-copilot-token-nncItI8D.js";
import "./boolean-BgXe2hyu.js";
import "./env-SxoKgHK1.js";
import "./host-env-security-ljCLeQmh.js";
import "./message-channel-CmNH1i-8.js";
import "./config-Ca77L3N1.js";
import "./env-vars-CvvqezS9.js";
import "./manifest-registry-L8eulu9n.js";
import "./dock-BAyVFjoI.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, s as isAudioAttachment, t as buildProviderRegistry } from "./runner-C_PvE9PO.js";
import "./image-1YtPREVu.js";
import "./models-config-DYcXOndH.js";
import "./pi-model-discovery-Bakt-Qrp.js";
import "./pi-embedded-helpers-IykXeTcj.js";
import "./sandbox-DRVWt7n5.js";
import "./tool-catalog-CrsxKKLj.js";
import "./chrome-BBeY99fu.js";
import "./tailscale-Cu00fx92.js";
import "./ip-D6hQ9Srg.js";
import "./tailnet-QICRxDwG.js";
import "./ws-D1QB-fai.js";
import "./auth-Bxx2VNC9.js";
import "./server-context-GXNpKSjl.js";
import "./frontmatter-DR47FZL2.js";
import "./skills-7LoesrWg.js";
import "./redact-FwcF9gh5.js";
import "./errors-B4zBevhh.js";
import "./fs-safe-DwCRJYoe.js";
import "./paths-DJ0CRxTh.js";
import "./ssrf-Bw0uz5oO.js";
import "./image-ops-De8KI3uW.js";
import "./store-BCXyE2P-.js";
import "./ports-C0wnBxwM.js";
import "./trash-BgvPEBCw.js";
import "./server-middleware-DfaRJTWr.js";
import "./sessions-BydE9SSo.js";
import "./plugins-DayOjXZ9.js";
import "./accounts-mX89jP1j.js";
import "./accounts-WdSU9oY0.js";
import "./accounts-qzL_Ozg5.js";
import "./bindings-DaFjLbOa.js";
import "./logging-6RmrnEvA.js";
import "./paths-DlJnj-kN.js";
import "./chat-envelope-BndZPORx.js";
import "./tool-images-DED-SeRD.js";
import "./tool-display-MIkhfqyT.js";
import "./fetch-guard-CJ_wKhxM.js";
import "./api-key-rotation-ByOea-20.js";
import "./local-roots-VOPct5kR.js";
import "./model-catalog-DN7KOzNl.js";

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