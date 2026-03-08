import "./agent-scope-DfPRIj4l.js";
import "./paths-CRyD285O.js";
import { $ as shouldLogVerbose, X as logVerbose } from "./subsystem-gWhP9HUz.js";
import "./workspace-CoXkK9vh.js";
import "./model-selection-DzQXaRi3.js";
import "./github-copilot-token-C_a0oOIO.js";
import "./env-DAOIQ0Je.js";
import "./boolean-mcn6kL0s.js";
import "./plugins-COkGaVNw.js";
import "./accounts-DqCt-wQc.js";
import "./bindings-OOnNFCB_.js";
import "./accounts-VI6oRB4t.js";
import "./image-ops-aD0BGevY.js";
import "./pi-model-discovery-C-yOXpma.js";
import "./message-channel-DNQoN51i.js";
import "./pi-embedded-helpers-DdtgKBS8.js";
import "./config-DPEn0sA9.js";
import "./manifest-registry-BjPRbY8q.js";
import "./dock-C7qdzomy.js";
import "./chrome-DUrZscND.js";
import "./ssrf-fLpTpy3w.js";
import "./frontmatter-DhbnPOGB.js";
import "./skills-C9mKKXRT.js";
import "./redact-DPmHLmw9.js";
import "./errors-Dt3U1F5S.js";
import "./fs-safe-BFmsMcLL.js";
import "./store-D020k9N1.js";
import "./sessions-CUpCpsNI.js";
import "./accounts-OCKm8qxp.js";
import "./paths-DtNnHbet.js";
import "./tool-images-D5ANUCus.js";
import "./thinking-6RspTgk5.js";
import "./image-CzHSa-_X.js";
import "./gemini-auth-RlLwqORB.js";
import "./fetch-guard-B6nV3reU.js";
import "./local-roots-CFUHsj1i.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, t as buildProviderRegistry, u as isAudioAttachment } from "./runner-B8op_Hh1.js";

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