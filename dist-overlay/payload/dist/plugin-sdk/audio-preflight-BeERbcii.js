import "./accounts-Dg_Jn43j.js";
import "./paths-DVWx7USN.js";
import "./github-copilot-token-Cg0YPPSu.js";
import "./config-CGGh37TZ.js";
import { $ as logVerbose, nt as shouldLogVerbose } from "./subsystem-BaHMxILP.js";
import "./command-format-BopkP03g.js";
import "./model-selection-Ci8st5Hn.js";
import "./agent-scope-Dse8uqIv.js";
import "./manifest-registry-BlYN_Oms.js";
import "./dock-RWo2ezbG.js";
import "./message-channel-CeGVmVeq.js";
import "./sessions-DmAkfHzo.js";
import "./plugins-D40OuDLZ.js";
import "./accounts-TR45XrOO.js";
import "./accounts-BSdSlBZU.js";
import "./bindings-Dwa28k3n.js";
import "./paths-DcieI7Jk.js";
import "./redact-Dr42lWji.js";
import "./errors-BF4JjsnI.js";
import "./fs-safe-Dd-u-yj0.js";
import "./image-ops-CrkHe2yG.js";
import "./ssrf-C8mJOpz5.js";
import "./fetch-guard-DrdTzp-o.js";
import "./local-roots-CbvahFFG.js";
import "./tool-images-S7yU49ho.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, t as buildProviderRegistry, u as isAudioAttachment } from "./runner-COq56U1b.js";
import "./skills-B8oYItUt.js";
import "./chrome-B1d3qSbJ.js";
import "./store-DOwToACM.js";
import "./pi-embedded-helpers-DYU0FcYb.js";
import "./thinking-C9dOVGlX.js";
import "./image-Crjr5H8G.js";
import "./pi-model-discovery-CFapGP7O.js";
import "./api-key-rotation-B7hXZDq4.js";

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