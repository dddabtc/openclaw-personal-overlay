import { t as buildOutboundMediaLoadOptions } from "./load-options-BNI6gFyz.js";
import { v as loadWebMedia } from "./ir-B5bFxswy.js";
import { a as saveMediaBuffer } from "./store-yB-jYpvW.js";
//#region src/media/outbound-attachment.ts
async function resolveOutboundAttachmentFromUrl(mediaUrl, maxBytes, options) {
	const media = await loadWebMedia(mediaUrl, buildOutboundMediaLoadOptions({
		maxBytes,
		mediaLocalRoots: options?.localRoots
	}));
	const saved = await saveMediaBuffer(media.buffer, media.contentType ?? void 0, "outbound", maxBytes);
	return {
		path: saved.path,
		contentType: saved.contentType
	};
}
//#endregion
export { resolveOutboundAttachmentFromUrl as t };
