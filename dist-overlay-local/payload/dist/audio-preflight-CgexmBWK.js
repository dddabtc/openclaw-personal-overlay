import "./paths-CyR9Pa1R.js";
import { J as logVerbose, Z as shouldLogVerbose } from "./registry-BmY4gNy6.js";
import "./agent-scope-BaNPxUDt.js";
import "./subsystem-B5g771Td.js";
import "./workspace-C6WgTYr8.js";
import "./plugins-TJvbNSdo.js";
import "./accounts-CfUI5fOs.js";
import "./boolean-B8-BqKGQ.js";
import "./command-format-Ck2WauwF.js";
import "./bindings-t1-P4kBT.js";
import "./accounts-KXQIhk1d.js";
import "./image-ops-Di1Eegus.js";
import "./model-auth-Ya7dMhOr.js";
import "./github-copilot-token-Dgb9dAHW.js";
import "./pi-model-discovery-DaNAekda.js";
import "./message-channel-CQCCb6Xy.js";
import "./pi-embedded-helpers-CqRD7mjY.js";
import "./config-CysLz7WS.js";
import "./manifest-registry-CY0aE-kW.js";
import "./chrome-CKATdJ66.js";
import "./frontmatter-CdkBcBAo.js";
import "./skills-DLRwGFBf.js";
import "./redact-jSxx6Ep2.js";
import "./errors-BoQgnc8X.js";
import "./ssrf-BTMDZjHT.js";
import "./store-BhpNzGEt.js";
import "./thinking-2XQ3oVP7.js";
import "./accounts-nMA3v-oF.js";
import "./paths-BEAbheM8.js";
import "./tool-images-VEoh5TwB.js";
import "./image-Bfa1MZ8i.js";
import "./gemini-auth-rsohQGb3.js";
import "./local-roots-CiMZVqut.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, t as buildProviderRegistry, u as isAudioAttachment } from "./runner-CccmbQfu.js";

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