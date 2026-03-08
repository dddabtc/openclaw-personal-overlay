import { v as defaultRuntime } from "./entry.js";
import "./auth-profiles-VHiPC1-T.js";
import { m as resolveSessionAgentId } from "./agent-scope-DhI_kPU3.js";
import { c as normalizeMainKey } from "./session-key-DIABCrXz.js";
import "./exec-TIZD7ZZn.js";
import "./github-copilot-token-DKRiM6oj.js";
import "./host-env-security-DyQuUnEd.js";
import "./model-CbAr_Ite.js";
import "./pi-model-discovery-CwESh4K1.js";
import "./frontmatter-17nP3KZr.js";
import "./skills-M3ShrlYm.js";
import "./manifest-registry-BgY5xgMH.js";
import { i as loadConfig } from "./config-CaJqgOvf.js";
import "./env-vars-iFkEK4MO.js";
import "./dock-D4HTBK6f.js";
import "./message-channel-CIQTys4Q.js";
import { h as updateSessionStore } from "./sessions-r0eCG3qK.js";
import { r as normalizeChannelId } from "./plugins-DS5tNvig.js";
import "./accounts-Q2sI0yx1.js";
import "./accounts-DTV7qtJm.js";
import "./accounts-Bgj4wZaj.js";
import "./bindings-BJckG653.js";
import "./logging-CFvkxgcX.js";
import "./send-CRkwo7xA.js";
import "./send-B1rNxrPo.js";
import { A as createOutboundSendDeps, E as agentCommand, En as requestHeartbeatNow, Sn as enqueueSystemEvent, pt as resolveOutboundTarget } from "./subagent-registry-CiKr2c80.js";
import "./paths-DDT5WL2f.js";
import "./chat-envelope-BG_U_muK.js";
import "./client-Bkvpx3HG.js";
import "./call-HfQjDsxN.js";
import "./pairing-token-CtND5y_8.js";
import "./net-C5Xzxz5G.js";
import "./ip-CyOZe5YF.js";
import "./tailnet-CC0kbSg4.js";
import "./tokens-k5g99v2x.js";
import "./with-timeout-4EEh7qHC.js";
import { t as deliverOutboundPayloads } from "./deliver-BjDdwcVK.js";
import "./diagnostic-J4rp2SRl.js";
import "./diagnostic-session-state-CT36_PCE.js";
import "./send-D1ZxBejn.js";
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
import "./exec-approvals-allowlist-BFdIZcKM.js";
import "./exec-safe-bin-runtime-policy-hoJHNODP.js";
import "./reply-prefix-BesSkS9Q.js";
import "./memory-cli-CbtYKXPl.js";
import "./manager-gyw0Q2gC.js";
import "./gemini-auth-Bym9uufz.js";
import "./fetch-guard-CozZxo_V.js";
import "./query-expansion-BEs7YpS_.js";
import "./retry-D7bSETth.js";
import "./target-errors-BLVNpa_x.js";
import "./chunk-KIogEvi4.js";
import "./markdown-tables-BZUA0Ci_.js";
import "./local-roots-CtEMMzoM.js";
import "./ir-Cgj_QBGB.js";
import "./render-CC7dS9Xb.js";
import "./commands-pdOUas3E.js";
import "./commands-registry-Cx9aOhEa.js";
import "./image-Be-lKO02.js";
import "./tool-display-BjKWYkZ_.js";
import "./runner-D3O98nXv.js";
import "./model-catalog-CxrBTiUJ.js";
import "./fetch-CHNZ_dCB.js";
import "./pairing-store-C9G8zMVO.js";
import "./exec-approvals-B7Du3_pT.js";
import "./nodes-screen-C3z0wL7F.js";
import { c as resolveGatewaySessionStoreTarget, o as loadSessionEntry, s as pruneLegacyStoreKeys } from "./session-utils-BbbX7T10.js";
import "./session-cost-usage-BVCE7Q2u.js";
import "./skill-commands-D7IBun_j.js";
import "./workspace-dirs-CXaWreqW.js";
import "./channel-activity-bWh1Qb3v.js";
import "./tables-Bm2dBo_l.js";
import "./server-lifecycle-B1onAHEw.js";
import "./stagger-DAKdJbmK.js";
import "./channel-selection-BiLB94ww.js";
import "./plugin-auto-enable-Cp3AF1aF.js";
import "./send-Co8at00v.js";
import "./outbound-attachment-BpdHwovB.js";
import "./delivery-queue-dGFvsvks.js";
import "./send-C_bnWVEB.js";
import "./resolve-route-DsNueEDS.js";
import "./proxy-DyD4fJMf.js";
import "./links-DfYXF6CQ.js";
import "./cli-utils-B_gcZWk3.js";
import "./help-format-Yb22e8jt.js";
import "./progress-DGbpXOaw.js";
import "./pi-tools.policy-ITFWKxH-.js";
import "./replies-7PqurdvB.js";
import "./onboard-helpers-CMXE26eK.js";
import "./prompt-style-wsroINzm.js";
import "./pairing-labels-jUrcrf8l.js";
import { c as parseMessageWithAttachments, l as formatForLog, r as registerApnsToken, s as normalizeRpcAttachmentsToChatAttachments } from "./push-apns-DfTDaQnp.js";
import { randomUUID } from "node:crypto";

//#region src/gateway/server-node-events.ts
const MAX_EXEC_EVENT_OUTPUT_CHARS = 180;
const VOICE_TRANSCRIPT_DEDUPE_WINDOW_MS = 1500;
const MAX_RECENT_VOICE_TRANSCRIPTS = 200;
const recentVoiceTranscripts = /* @__PURE__ */ new Map();
function normalizeNonEmptyString(value) {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}
function normalizeFiniteInteger(value) {
	return typeof value === "number" && Number.isFinite(value) ? Math.trunc(value) : null;
}
function resolveVoiceTranscriptFingerprint(obj, text) {
	const eventId = normalizeNonEmptyString(obj.eventId) ?? normalizeNonEmptyString(obj.providerEventId) ?? normalizeNonEmptyString(obj.transcriptId);
	if (eventId) return `event:${eventId}`;
	const callId = normalizeNonEmptyString(obj.providerCallId) ?? normalizeNonEmptyString(obj.callId);
	const sequence = normalizeFiniteInteger(obj.sequence) ?? normalizeFiniteInteger(obj.seq);
	if (callId && sequence !== null) return `call-seq:${callId}:${sequence}`;
	const eventTimestamp = normalizeFiniteInteger(obj.timestamp) ?? normalizeFiniteInteger(obj.ts) ?? normalizeFiniteInteger(obj.eventTimestamp);
	if (callId && eventTimestamp !== null) return `call-ts:${callId}:${eventTimestamp}`;
	if (eventTimestamp !== null) return `timestamp:${eventTimestamp}|text:${text}`;
	return `text:${text}`;
}
function shouldDropDuplicateVoiceTranscript(params) {
	const previous = recentVoiceTranscripts.get(params.sessionKey);
	if (previous && previous.fingerprint === params.fingerprint && params.now - previous.ts <= VOICE_TRANSCRIPT_DEDUPE_WINDOW_MS) return true;
	recentVoiceTranscripts.set(params.sessionKey, {
		fingerprint: params.fingerprint,
		ts: params.now
	});
	if (recentVoiceTranscripts.size > MAX_RECENT_VOICE_TRANSCRIPTS) {
		const cutoff = params.now - VOICE_TRANSCRIPT_DEDUPE_WINDOW_MS * 2;
		for (const [key, value] of recentVoiceTranscripts) {
			if (value.ts < cutoff) recentVoiceTranscripts.delete(key);
			if (recentVoiceTranscripts.size <= MAX_RECENT_VOICE_TRANSCRIPTS) break;
		}
		while (recentVoiceTranscripts.size > MAX_RECENT_VOICE_TRANSCRIPTS) {
			const oldestKey = recentVoiceTranscripts.keys().next().value;
			if (oldestKey === void 0) break;
			recentVoiceTranscripts.delete(oldestKey);
		}
	}
	return false;
}
function compactExecEventOutput(raw) {
	const normalized = raw.replace(/\s+/g, " ").trim();
	if (!normalized) return "";
	if (normalized.length <= MAX_EXEC_EVENT_OUTPUT_CHARS) return normalized;
	const safe = Math.max(1, MAX_EXEC_EVENT_OUTPUT_CHARS - 1);
	return `${normalized.slice(0, safe)}…`;
}
async function touchSessionStore(params) {
	const { storePath } = params;
	if (!storePath) return;
	await updateSessionStore(storePath, (store) => {
		const target = resolveGatewaySessionStoreTarget({
			cfg: params.cfg,
			key: params.sessionKey,
			store
		});
		pruneLegacyStoreKeys({
			store,
			canonicalKey: target.canonicalKey,
			candidates: target.storeKeys
		});
		store[params.canonicalKey] = {
			sessionId: params.sessionId,
			updatedAt: params.now,
			thinkingLevel: params.entry?.thinkingLevel,
			verboseLevel: params.entry?.verboseLevel,
			reasoningLevel: params.entry?.reasoningLevel,
			systemSent: params.entry?.systemSent,
			sendPolicy: params.entry?.sendPolicy,
			lastChannel: params.entry?.lastChannel,
			lastTo: params.entry?.lastTo
		};
	});
}
function queueSessionStoreTouch(params) {
	touchSessionStore({
		cfg: params.cfg,
		sessionKey: params.sessionKey,
		storePath: params.storePath,
		canonicalKey: params.canonicalKey,
		entry: params.entry,
		sessionId: params.sessionId,
		now: params.now
	}).catch((err) => {
		params.ctx.logGateway.warn("voice session-store update failed: " + formatForLog(err));
	});
}
function parseSessionKeyFromPayloadJSON(payloadJSON) {
	let payload;
	try {
		payload = JSON.parse(payloadJSON);
	} catch {
		return null;
	}
	if (typeof payload !== "object" || payload === null) return null;
	const obj = payload;
	const sessionKey = typeof obj.sessionKey === "string" ? obj.sessionKey.trim() : "";
	return sessionKey.length > 0 ? sessionKey : null;
}
function parsePayloadObject(payloadJSON) {
	if (!payloadJSON) return null;
	let payload;
	try {
		payload = JSON.parse(payloadJSON);
	} catch {
		return null;
	}
	return typeof payload === "object" && payload !== null ? payload : null;
}
async function sendReceiptAck(params) {
	const resolved = resolveOutboundTarget({
		channel: params.channel,
		to: params.to,
		cfg: params.cfg,
		mode: "explicit"
	});
	if (!resolved.ok) throw new Error(String(resolved.error));
	const agentId = resolveSessionAgentId({
		sessionKey: params.sessionKey,
		config: params.cfg
	});
	await deliverOutboundPayloads({
		cfg: params.cfg,
		channel: params.channel,
		to: resolved.to,
		payloads: [{ text: params.text }],
		agentId,
		bestEffort: true,
		deps: createOutboundSendDeps(params.deps)
	});
}
const handleNodeEvent = async (ctx, nodeId, evt) => {
	switch (evt.event) {
		case "voice.transcript": {
			const obj = parsePayloadObject(evt.payloadJSON);
			if (!obj) return;
			const text = typeof obj.text === "string" ? obj.text.trim() : "";
			if (!text) return;
			if (text.length > 2e4) return;
			const sessionKeyRaw = typeof obj.sessionKey === "string" ? obj.sessionKey.trim() : "";
			const cfg = loadConfig();
			const rawMainKey = normalizeMainKey(cfg.session?.mainKey);
			const sessionKey = sessionKeyRaw.length > 0 ? sessionKeyRaw : rawMainKey;
			const { storePath, entry, canonicalKey } = loadSessionEntry(sessionKey);
			const now = Date.now();
			if (shouldDropDuplicateVoiceTranscript({
				sessionKey: canonicalKey,
				fingerprint: resolveVoiceTranscriptFingerprint(obj, text),
				now
			})) return;
			const sessionId = entry?.sessionId ?? randomUUID();
			queueSessionStoreTouch({
				ctx,
				cfg,
				sessionKey,
				storePath,
				canonicalKey,
				entry,
				sessionId,
				now
			});
			ctx.addChatRun(sessionId, {
				sessionKey: canonicalKey,
				clientRunId: `voice-${randomUUID()}`
			});
			agentCommand({
				message: text,
				sessionId,
				sessionKey: canonicalKey,
				thinking: "low",
				deliver: false,
				messageChannel: "node",
				inputProvenance: {
					kind: "external_user",
					sourceChannel: "voice",
					sourceTool: "gateway.voice.transcript"
				}
			}, defaultRuntime, ctx.deps).catch((err) => {
				ctx.logGateway.warn(`agent failed node=${nodeId}: ${formatForLog(err)}`);
			});
			return;
		}
		case "agent.request": {
			if (!evt.payloadJSON) return;
			let link = null;
			try {
				link = JSON.parse(evt.payloadJSON);
			} catch {
				return;
			}
			let message = (link?.message ?? "").trim();
			const normalizedAttachments = normalizeRpcAttachmentsToChatAttachments(link?.attachments ?? void 0);
			let images = [];
			if (normalizedAttachments.length > 0) try {
				const parsed = await parseMessageWithAttachments(message, normalizedAttachments, {
					maxBytes: 5e6,
					log: ctx.logGateway
				});
				message = parsed.message.trim();
				images = parsed.images;
			} catch {
				return;
			}
			if (!message) return;
			if (message.length > 2e4) return;
			let channel = normalizeChannelId(typeof link?.channel === "string" ? link.channel.trim() : "") ?? void 0;
			let to = typeof link?.to === "string" && link.to.trim() ? link.to.trim() : void 0;
			const deliverRequested = Boolean(link?.deliver);
			const wantsReceipt = Boolean(link?.receipt);
			const receiptText = (typeof link?.receiptText === "string" ? link.receiptText.trim() : "") || "Just received your iOS share + request, working on it.";
			const sessionKeyRaw = (link?.sessionKey ?? "").trim();
			const sessionKey = sessionKeyRaw.length > 0 ? sessionKeyRaw : `node-${nodeId}`;
			const cfg = loadConfig();
			const { storePath, entry, canonicalKey } = loadSessionEntry(sessionKey);
			const now = Date.now();
			const sessionId = entry?.sessionId ?? randomUUID();
			await touchSessionStore({
				cfg,
				sessionKey,
				storePath,
				canonicalKey,
				entry,
				sessionId,
				now
			});
			if (deliverRequested && (!channel || !to)) {
				const entryChannel = typeof entry?.lastChannel === "string" ? normalizeChannelId(entry.lastChannel) : void 0;
				const entryTo = typeof entry?.lastTo === "string" ? entry.lastTo.trim() : "";
				if (!channel && entryChannel) channel = entryChannel;
				if (!to && entryTo) to = entryTo;
			}
			const deliver = deliverRequested && Boolean(channel && to);
			const deliveryChannel = deliver ? channel : void 0;
			const deliveryTo = deliver ? to : void 0;
			if (deliverRequested && !deliver) ctx.logGateway.warn(`agent delivery disabled node=${nodeId}: missing session delivery route (channel=${channel ?? "-"} to=${to ?? "-"})`);
			if (wantsReceipt && deliveryChannel && deliveryTo) sendReceiptAck({
				cfg,
				deps: ctx.deps,
				sessionKey: canonicalKey,
				channel: deliveryChannel,
				to: deliveryTo,
				text: receiptText
			}).catch((err) => {
				ctx.logGateway.warn(`agent receipt failed node=${nodeId}: ${formatForLog(err)}`);
			});
			else if (wantsReceipt) ctx.logGateway.warn(`agent receipt skipped node=${nodeId}: missing delivery route (channel=${deliveryChannel ?? "-"} to=${deliveryTo ?? "-"})`);
			agentCommand({
				message,
				images,
				sessionId,
				sessionKey: canonicalKey,
				thinking: link?.thinking ?? void 0,
				deliver,
				to: deliveryTo,
				channel: deliveryChannel,
				timeout: typeof link?.timeoutSeconds === "number" ? link.timeoutSeconds.toString() : void 0,
				messageChannel: "node"
			}, defaultRuntime, ctx.deps).catch((err) => {
				ctx.logGateway.warn(`agent failed node=${nodeId}: ${formatForLog(err)}`);
			});
			return;
		}
		case "chat.subscribe": {
			if (!evt.payloadJSON) return;
			const sessionKey = parseSessionKeyFromPayloadJSON(evt.payloadJSON);
			if (!sessionKey) return;
			ctx.nodeSubscribe(nodeId, sessionKey);
			return;
		}
		case "chat.unsubscribe": {
			if (!evt.payloadJSON) return;
			const sessionKey = parseSessionKeyFromPayloadJSON(evt.payloadJSON);
			if (!sessionKey) return;
			ctx.nodeUnsubscribe(nodeId, sessionKey);
			return;
		}
		case "exec.started":
		case "exec.finished":
		case "exec.denied": {
			const obj = parsePayloadObject(evt.payloadJSON);
			if (!obj) return;
			const sessionKey = typeof obj.sessionKey === "string" ? obj.sessionKey.trim() : `node-${nodeId}`;
			if (!sessionKey) return;
			if (!(loadConfig().tools?.exec?.notifyOnExit !== false)) return;
			const runId = typeof obj.runId === "string" ? obj.runId.trim() : "";
			const command = typeof obj.command === "string" ? obj.command.trim() : "";
			const exitCode = typeof obj.exitCode === "number" && Number.isFinite(obj.exitCode) ? obj.exitCode : void 0;
			const timedOut = obj.timedOut === true;
			const output = typeof obj.output === "string" ? obj.output.trim() : "";
			const reason = typeof obj.reason === "string" ? obj.reason.trim() : "";
			let text = "";
			if (evt.event === "exec.started") {
				text = `Exec started (node=${nodeId}${runId ? ` id=${runId}` : ""})`;
				if (command) text += `: ${command}`;
			} else if (evt.event === "exec.finished") {
				const exitLabel = timedOut ? "timeout" : `code ${exitCode ?? "?"}`;
				const compactOutput = compactExecEventOutput(output);
				if (!(timedOut || exitCode !== 0 || compactOutput.length > 0)) return;
				text = `Exec finished (node=${nodeId}${runId ? ` id=${runId}` : ""}, ${exitLabel})`;
				if (compactOutput) text += `\n${compactOutput}`;
			} else {
				text = `Exec denied (node=${nodeId}${runId ? ` id=${runId}` : ""}${reason ? `, ${reason}` : ""})`;
				if (command) text += `: ${command}`;
			}
			enqueueSystemEvent(text, {
				sessionKey,
				contextKey: runId ? `exec:${runId}` : "exec"
			});
			requestHeartbeatNow({ reason: "exec-event" });
			return;
		}
		case "push.apns.register": {
			const obj = parsePayloadObject(evt.payloadJSON);
			if (!obj) return;
			const token = typeof obj.token === "string" ? obj.token : "";
			const topic = typeof obj.topic === "string" ? obj.topic : "";
			const environment = obj.environment;
			try {
				await registerApnsToken({
					nodeId,
					token,
					topic,
					environment
				});
			} catch (err) {
				ctx.logGateway.warn(`push apns register failed node=${nodeId}: ${formatForLog(err)}`);
			}
			return;
		}
		default: return;
	}
};

//#endregion
export { handleNodeEvent };