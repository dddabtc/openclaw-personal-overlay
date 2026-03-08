import "./agent-scope-DMje6vKy.js";
import "./paths-BY8fKpqm.js";
import { $ as shouldLogVerbose, X as logVerbose } from "./subsystem-DGf9i1vB.js";
import "./model-selection-CuFrx3OC.js";
import "./github-copilot-token-D8k4aAom.js";
import "./env-DTvoLNIG.js";
import "./plugins-CIeR04uK.js";
import "./accounts-C_w1Poji.js";
import "./bindings-Wera7Q9t.js";
import "./accounts-Bel7phwo.js";
import "./image-ops-Myp-iLbA.js";
import "./pi-model-discovery-DaNAekda.js";
import "./message-channel-16Nvjpve.js";
import "./pi-embedded-helpers-B1gkp2UU.js";
import "./config-BsU5w2f3.js";
import "./manifest-registry-CGNISBxk.js";
import "./dock-DYI7JdYH.js";
import "./chrome-BwY_WHy0.js";
import "./ssrf-CzjOVP3a.js";
import "./skills-BnkC2Tc7.js";
import "./redact-BKGpMTj6.js";
import "./errors-7W4BIcyZ.js";
import "./fs-safe-BETzZuqK.js";
import "./store-BhzdXcBy.js";
import "./sessions-BqxZ3Ttz.js";
import "./accounts-lCrLKbJI.js";
import "./paths-D0iyPA23.js";
import "./tool-images-t78eqsOg.js";
import "./thinking-D7pOfoaj.js";
import "./image-BMByzQUH.js";
import "./gemini-auth-DVLES2aH.js";
import "./fetch-guard-BYE2mX-t.js";
import "./local-roots-fjj7eBkP.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, t as buildProviderRegistry, u as isAudioAttachment } from "./runner-D__sQhh_.js";

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