import "./paths-B4BZAPZh.js";
import { F as shouldLogVerbose, M as logVerbose } from "./utils-CP9YLh6M.js";
import "./thinking-EAliFiVK.js";
import "./registry-B-j4DRfe.js";
import "./subsystem-BCQGGxdd.js";
import "./exec-DYqRzFbo.js";
import "./agent-scope-B36jktKj.js";
import "./model-selection-mHHEzs4Y.js";
import "./github-copilot-token-D2zp6kMZ.js";
import "./boolean-BsqeuxE6.js";
import "./env-VriqyjXT.js";
import "./message-channel-Bena1Tzd.js";
import "./config-HiRdak1Z.js";
import "./manifest-registry-D2lPzXIl.js";
import { a as resolveMediaAttachmentLocalRoots, n as createMediaAttachmentCache, o as runCapability, r as normalizeMediaAttachments, s as isAudioAttachment, t as buildProviderRegistry } from "./runner-BMiD7Bzr.js";
import "./image-_YQgqCp8.js";
import "./models-config-DDf0A41J.js";
import "./pi-model-discovery-4uUnLc3n.js";
import "./pi-embedded-helpers-BXORfBBG.js";
import "./sandbox-DBfPqzy1.js";
import "./chrome-DyU5oS8r.js";
import "./tailscale-Lro1Kj8C.js";
import "./auth-G84EF23T.js";
import "./server-context-DZ5TWZsK.js";
import "./frontmatter-C_R2lwvR.js";
import "./skills-DF14CP8t.js";
import "./routes-DThMzaHt.js";
import "./redact-f-Q-hFt_.js";
import "./errors-BF3TeRH2.js";
import "./fs-safe-CUjO1ca2.js";
import "./paths-CrFY6bY4.js";
import "./ssrf-BCYMnxkM.js";
import "./image-ops-CtnOR38U.js";
import "./store-DH3Bsx5y.js";
import "./ports-D_IqQOiD.js";
import "./trash-DXPbQEbW.js";
import "./sessions-CLVPlumA.js";
import "./dock-SQwuNDYw.js";
import "./plugins-CTO4bTbI.js";
import "./accounts-CznR-8mo.js";
import "./accounts-Dq_1iSiE.js";
import "./accounts-DTj1Pkjk.js";
import "./bindings-Dnyf3pJk.js";
import "./logging-w5jq5901.js";
import "./paths-C6eomcf_.js";
import "./tool-images-DoR5YQkw.js";
import "./tool-display-BvrygsZB.js";
import "./fetch-guard-bFjgj5XZ.js";
import "./api-key-rotation-Cm4ZjNxG.js";
import "./local-roots-kq2C9EhR.js";
import "./model-catalog-DoHHvz7d.js";

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