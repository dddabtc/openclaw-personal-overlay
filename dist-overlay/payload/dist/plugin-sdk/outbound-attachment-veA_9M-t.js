import { a as saveMediaBuffer } from "./store-ILDCvOLN.js";
import { _ as loadWebMedia } from "./ir-BQGV_zsI.js";
import { t as buildOutboundMediaLoadOptions } from "./load-options-CTDTM3N1.js";
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
