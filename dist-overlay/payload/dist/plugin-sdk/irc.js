import { B as issuePairingChallenge, G as resolveEffectiveAllowFromLists, H as readStoreAllowFromForDmPolicy, J as createReplyPrefixOptions, Q as resolveControlCommandGate, V as formatDocsLink, Z as logInboundDrop, q as isDangerousNameMatchingEnabled } from "./dispatch-DlrYXCV1.js";
import { lt as DEFAULT_ACCOUNT_ID, ut as normalizeAccountId } from "./run-with-concurrency-XmKq-xNS.js";
import { _ as createAccountListHelpers } from "./accounts-D-pSCe1E.js";
import { G as DmConfigSchema, J as MarkdownConfigSchema, K as DmPolicySchema, Or as normalizeResolvedSecretInputString, U as ToolPolicySchema, Ur as formatCliCommand, W as BlockStreamingCoalesceSchema, X as requireOpenAllowFrom, Y as ReplyRuntimeConfigSchemaShape, jt as getChatChannelMeta, q as GroupPolicySchema } from "./model-auth-Ciehz0x5.js";
import "./logger-Cxu-Klb_.js";
import "./paths-akVZbnot.js";
import "./github-copilot-token-CjEwwa4e.js";
import "./thinking-WQ4Zq8Nl.js";
import { Ft as resolveDefaultGroupPolicy, Lt as warnMissingProviderGroupPolicyFallbackOnce, Nt as GROUP_POLICY_BLOCKED_LABEL, Pt as resolveAllowlistProviderRuntimeGroupPolicy } from "./send-CkbBpEOs.js";
import "./send-BuYO3M6b.js";
import "./plugins-BRc1Q7T_.js";
import "./send-CcExAnhM.js";
import "./image-ops-Dk-eCx13.js";
import "./pi-embedded-helpers-CRUVFL1T.js";
import "./accounts-CxcktMra.js";
import "./paths-D8Z6gklo.js";
import "./deliver-PHG2xaoU.js";
import "./diagnostic-Bmtj7hMo.js";
import "./pi-model-discovery-CXAteumd.js";
import "./audio-transcription-runner-Bsyu4xAK.js";
import "./image-gqHdJiG1.js";
import "./chrome-RQlOCmEX.js";
import "./skills-D8U5gdXQ.js";
import "./path-alias-guards-CVixGQ86.js";
import "./redact-BLCBOszJ.js";
import "./errors-ClHdc6fp.js";
import "./fs-safe-hj1IvA_7.js";
import "./proxy-env-CvggZGlz.js";
import "./store-BH01nQaY.js";
import "./tool-images-BGLdo76D.js";
import "./fetch-guard-DcsgYxhP.js";
import "./api-key-rotation-BBufJSdT.js";
import "./local-roots-CPwI1Doe.js";
import "./proxy-fetch-o2k_1EOm.js";
import "./tokens-C3YaGU_B.js";
import "./commands-registry-B4ZP4Y1B.js";
import "./skill-commands-C2t-mmXu.js";
import "./ir-3PfuDyez.js";
import "./render-hUn-4tdL.js";
import "./target-errors-CG_VfnV6.js";
import "./channel-activity-CeIW7HtN.js";
import "./fetch-Xb84ORZK.js";
import "./tables-DZahQnzD.js";
import "./send-CnVDGOnZ.js";
import "./proxy-CgXTW63Y.js";
import "./outbound-attachment-DB0FrUca.js";
import "./send-BOy48qeo.js";
import "./manager-CIqGMwbi.js";
import "./query-expansion-CL2_4nga.js";
import { format } from "node:util";
//#region src/channels/plugins/config-helpers.ts
function setAccountEnabledInConfigSection(params) {
	const accountKey = params.accountId || "default";
	const base = params.cfg.channels?.[params.sectionKey];
	const hasAccounts = Boolean(base?.accounts);
	if (params.allowTopLevel && accountKey === "default" && !hasAccounts) return {
		...params.cfg,
		channels: {
			...params.cfg.channels,
			[params.sectionKey]: {
				...base,
				enabled: params.enabled
			}
		}
	};
	const baseAccounts = base?.accounts ?? {};
	const existing = baseAccounts[accountKey] ?? {};
	return {
		...params.cfg,
		channels: {
			...params.cfg.channels,
			[params.sectionKey]: {
				...base,
				accounts: {
					...baseAccounts,
					[accountKey]: {
						...existing,
						enabled: params.enabled
					}
				}
			}
		}
	};
}
function deleteAccountFromConfigSection(params) {
	const accountKey = params.accountId || "default";
	const base = params.cfg.channels?.[params.sectionKey];
	if (!base) return params.cfg;
	const baseAccounts = base.accounts && typeof base.accounts === "object" ? { ...base.accounts } : void 0;
	if (accountKey !== "default") {
		const accounts = baseAccounts ? { ...baseAccounts } : {};
		delete accounts[accountKey];
		return {
			...params.cfg,
			channels: {
				...params.cfg.channels,
				[params.sectionKey]: {
					...base,
					accounts: Object.keys(accounts).length ? accounts : void 0
				}
			}
		};
	}
	if (baseAccounts && Object.keys(baseAccounts).length > 0) {
		delete baseAccounts[accountKey];
		const baseRecord = { ...base };
		for (const field of params.clearBaseFields ?? []) if (field in baseRecord) baseRecord[field] = void 0;
		return {
			...params.cfg,
			channels: {
				...params.cfg.channels,
				[params.sectionKey]: {
					...baseRecord,
					accounts: Object.keys(baseAccounts).length ? baseAccounts : void 0
				}
			}
		};
	}
	const nextChannels = { ...params.cfg.channels };
	delete nextChannels[params.sectionKey];
	const nextCfg = { ...params.cfg };
	if (Object.keys(nextChannels).length > 0) nextCfg.channels = nextChannels;
	else delete nextCfg.channels;
	return nextCfg;
}
//#endregion
//#region src/channels/plugins/config-schema.ts
function buildChannelConfigSchema(schema) {
	const schemaWithJson = schema;
	if (typeof schemaWithJson.toJSONSchema === "function") return { schema: schemaWithJson.toJSONSchema({
		target: "draft-07",
		unrepresentable: "any"
	}) };
	return { schema: {
		type: "object",
		additionalProperties: true
	} };
}
//#endregion
//#region src/channels/plugins/helpers.ts
function formatPairingApproveHint(channelId) {
	return `Approve via: ${formatCliCommand(`openclaw pairing list ${channelId}`)} / ${formatCliCommand(`openclaw pairing approve ${channelId} <code>`)}`;
}
//#endregion
//#region src/plugin-sdk/onboarding.ts
async function promptAccountId$1(params) {
	const existingIds = params.listAccountIds(params.cfg);
	const initial = params.currentId?.trim() || params.defaultAccountId || "default";
	const choice = await params.prompter.select({
		message: `${params.label} account`,
		options: [...existingIds.map((id) => ({
			value: id,
			label: id === "default" ? "default (primary)" : id
		})), {
			value: "__new__",
			label: "Add a new account"
		}],
		initialValue: initial
	});
	if (choice !== "__new__") return normalizeAccountId(choice);
	const entered = await params.prompter.text({
		message: `New ${params.label} account id`,
		validate: (value) => value?.trim() ? void 0 : "Required"
	});
	const normalized = normalizeAccountId(String(entered));
	if (String(entered).trim() !== normalized) await params.prompter.note(`Normalized account id to "${normalized}".`, `${params.label} account`);
	return normalized;
}
//#endregion
//#region src/channels/plugins/onboarding/helpers.ts
const promptAccountId = async (params) => {
	return await promptAccountId$1(params);
};
function addWildcardAllowFrom(allowFrom) {
	const next = (allowFrom ?? []).map((v) => String(v).trim()).filter(Boolean);
	if (!next.includes("*")) next.push("*");
	return next;
}
function splitOnboardingEntries(raw) {
	return raw.split(/[\n,;]+/g).map((entry) => entry.trim()).filter(Boolean);
}
async function resolveAccountIdForConfigure(params) {
	const override = params.accountOverride?.trim();
	let accountId = override ? normalizeAccountId(override) : params.defaultAccountId;
	if (params.shouldPromptAccountIds && !override) accountId = await promptAccountId({
		cfg: params.cfg,
		prompter: params.prompter,
		label: params.label,
		currentId: accountId,
		listAccountIds: params.listAccountIds,
		defaultAccountId: params.defaultAccountId
	});
	return accountId;
}
function setTopLevelChannelAllowFrom(params) {
	const channelConfig = params.cfg.channels?.[params.channel] ?? {};
	return {
		...params.cfg,
		channels: {
			...params.cfg.channels,
			[params.channel]: {
				...channelConfig,
				...params.enabled ? { enabled: true } : {},
				allowFrom: params.allowFrom
			}
		}
	};
}
function setTopLevelChannelDmPolicyWithAllowFrom(params) {
	const channelConfig = params.cfg.channels?.[params.channel] ?? {};
	const existingAllowFrom = params.getAllowFrom?.(params.cfg) ?? channelConfig.allowFrom ?? void 0;
	const allowFrom = params.dmPolicy === "open" ? addWildcardAllowFrom(existingAllowFrom) : void 0;
	return {
		...params.cfg,
		channels: {
			...params.cfg.channels,
			[params.channel]: {
				...channelConfig,
				dmPolicy: params.dmPolicy,
				...allowFrom ? { allowFrom } : {}
			}
		}
	};
}
//#endregion
//#region src/channels/plugins/onboarding/channel-access.ts
function parseAllowlistEntries(raw) {
	return splitOnboardingEntries(String(raw ?? ""));
}
function formatAllowlistEntries(entries) {
	return entries.map((entry) => entry.trim()).filter(Boolean).join(", ");
}
async function promptChannelAccessPolicy(params) {
	const options = [{
		value: "allowlist",
		label: "Allowlist (recommended)"
	}];
	if (params.allowOpen !== false) options.push({
		value: "open",
		label: "Open (allow all channels)"
	});
	if (params.allowDisabled !== false) options.push({
		value: "disabled",
		label: "Disabled (block all channels)"
	});
	const initialValue = params.currentPolicy ?? "allowlist";
	return await params.prompter.select({
		message: `${params.label} access`,
		options,
		initialValue
	});
}
async function promptChannelAllowlist(params) {
	const initialValue = params.currentEntries && params.currentEntries.length > 0 ? formatAllowlistEntries(params.currentEntries) : void 0;
	return parseAllowlistEntries(await params.prompter.text({
		message: `${params.label} allowlist (comma-separated)`,
		placeholder: params.placeholder,
		initialValue
	}));
}
async function promptChannelAccessConfig(params) {
	const hasEntries = (params.currentEntries ?? []).length > 0;
	const shouldPrompt = params.defaultPrompt ?? !hasEntries;
	if (!await params.prompter.confirm({
		message: params.updatePrompt ? `Update ${params.label} access?` : `Configure ${params.label} access?`,
		initialValue: shouldPrompt
	})) return null;
	const policy = await promptChannelAccessPolicy({
		prompter: params.prompter,
		label: params.label,
		currentPolicy: params.currentPolicy,
		allowOpen: params.allowOpen,
		allowDisabled: params.allowDisabled
	});
	if (policy !== "allowlist") return {
		policy,
		entries: []
	};
	return {
		policy,
		entries: await promptChannelAllowlist({
			prompter: params.prompter,
			label: params.label,
			currentEntries: params.currentEntries,
			placeholder: params.placeholder
		})
	};
}
//#endregion
//#region src/channels/plugins/pairing-message.ts
const PAIRING_APPROVED_MESSAGE = "✅ OpenClaw access approved. Send a message to start chatting.";
//#endregion
//#region src/plugins/config-schema.ts
function error(message) {
	return {
		success: false,
		error: { issues: [{
			path: [],
			message
		}] }
	};
}
function emptyPluginConfigSchema() {
	return {
		safeParse(value) {
			if (value === void 0) return {
				success: true,
				data: void 0
			};
			if (!value || typeof value !== "object" || Array.isArray(value)) return error("expected config object");
			if (Object.keys(value).length > 0) return error("config must be empty");
			return {
				success: true,
				data: value
			};
		},
		jsonSchema: {
			type: "object",
			additionalProperties: false,
			properties: {}
		}
	};
}
//#endregion
//#region src/plugin-sdk/pairing-access.ts
function createScopedPairingAccess(params) {
	const resolvedAccountId = normalizeAccountId(params.accountId);
	return {
		accountId: resolvedAccountId,
		readAllowFromStore: () => params.core.channel.pairing.readAllowFromStore({
			channel: params.channel,
			accountId: resolvedAccountId
		}),
		readStoreForDmPolicy: (provider, accountId) => params.core.channel.pairing.readAllowFromStore({
			channel: provider,
			accountId: normalizeAccountId(accountId)
		}),
		upsertPairingRequest: (input) => params.core.channel.pairing.upsertPairingRequest({
			channel: params.channel,
			accountId: resolvedAccountId,
			...input
		})
	};
}
//#endregion
//#region src/plugin-sdk/reply-payload.ts
function normalizeOutboundReplyPayload(payload) {
	return {
		text: typeof payload.text === "string" ? payload.text : void 0,
		mediaUrls: Array.isArray(payload.mediaUrls) ? payload.mediaUrls.filter((entry) => typeof entry === "string" && entry.length > 0) : void 0,
		mediaUrl: typeof payload.mediaUrl === "string" ? payload.mediaUrl : void 0,
		replyToId: typeof payload.replyToId === "string" ? payload.replyToId : void 0
	};
}
function createNormalizedOutboundDeliverer(handler) {
	return async (payload) => {
		await handler(payload && typeof payload === "object" ? normalizeOutboundReplyPayload(payload) : {});
	};
}
function resolveOutboundMediaUrls(payload) {
	if (payload.mediaUrls?.length) return payload.mediaUrls;
	if (payload.mediaUrl) return [payload.mediaUrl];
	return [];
}
function formatTextWithAttachmentLinks(text, mediaUrls) {
	const trimmedText = text?.trim() ?? "";
	if (!trimmedText && mediaUrls.length === 0) return "";
	const mediaBlock = mediaUrls.length ? mediaUrls.map((url) => `Attachment: ${url}`).join("\n") : "";
	if (!trimmedText) return mediaBlock;
	if (!mediaBlock) return trimmedText;
	return `${trimmedText}\n\n${mediaBlock}`;
}
//#endregion
//#region src/plugin-sdk/inbound-reply-dispatch.ts
function buildInboundReplyDispatchBase(params) {
	return {
		cfg: params.cfg,
		channel: params.channel,
		accountId: params.accountId,
		agentId: params.route.agentId,
		routeSessionKey: params.route.sessionKey,
		storePath: params.storePath,
		ctxPayload: params.ctxPayload,
		recordInboundSession: params.core.channel.session.recordInboundSession,
		dispatchReplyWithBufferedBlockDispatcher: params.core.channel.reply.dispatchReplyWithBufferedBlockDispatcher
	};
}
async function dispatchInboundReplyWithBase(params) {
	await recordInboundSessionAndDispatchReply({
		...buildInboundReplyDispatchBase(params),
		deliver: params.deliver,
		onRecordError: params.onRecordError,
		onDispatchError: params.onDispatchError,
		replyOptions: params.replyOptions
	});
}
async function recordInboundSessionAndDispatchReply(params) {
	await params.recordInboundSession({
		storePath: params.storePath,
		sessionKey: params.ctxPayload.SessionKey ?? params.routeSessionKey,
		ctx: params.ctxPayload,
		onRecordError: params.onRecordError
	});
	const { onModelSelected, ...prefixOptions } = createReplyPrefixOptions({
		cfg: params.cfg,
		agentId: params.agentId,
		channel: params.channel,
		accountId: params.accountId
	});
	const deliver = createNormalizedOutboundDeliverer(params.deliver);
	await params.dispatchReplyWithBufferedBlockDispatcher({
		ctx: params.ctxPayload,
		cfg: params.cfg,
		dispatcherOptions: {
			...prefixOptions,
			deliver,
			onError: params.onDispatchError
		},
		replyOptions: {
			...params.replyOptions,
			onModelSelected
		}
	});
}
//#endregion
//#region src/plugin-sdk/runtime.ts
function createLoggerBackedRuntime(params) {
	return {
		log: (...args) => {
			params.logger.info(format(...args));
		},
		error: (...args) => {
			params.logger.error(format(...args));
		},
		exit: (code) => {
			throw params.exitError?.(code) ?? /* @__PURE__ */ new Error(`exit ${code}`);
		}
	};
}
//#endregion
//#region src/plugin-sdk/status-helpers.ts
function buildBaseChannelStatusSummary(snapshot) {
	return {
		configured: snapshot.configured ?? false,
		running: snapshot.running ?? false,
		lastStartAt: snapshot.lastStartAt ?? null,
		lastStopAt: snapshot.lastStopAt ?? null,
		lastError: snapshot.lastError ?? null
	};
}
function buildBaseAccountStatusSnapshot(params) {
	const { account, runtime, probe } = params;
	return {
		accountId: account.accountId,
		name: account.name,
		enabled: account.enabled,
		configured: account.configured,
		...buildRuntimeAccountStatusSnapshot({
			runtime,
			probe
		}),
		lastInboundAt: runtime?.lastInboundAt ?? null,
		lastOutboundAt: runtime?.lastOutboundAt ?? null
	};
}
function buildRuntimeAccountStatusSnapshot(params) {
	const { runtime, probe } = params;
	return {
		running: runtime?.running ?? false,
		lastStartAt: runtime?.lastStartAt ?? null,
		lastStopAt: runtime?.lastStopAt ?? null,
		lastError: runtime?.lastError ?? null,
		probe
	};
}
//#endregion
export { BlockStreamingCoalesceSchema, DEFAULT_ACCOUNT_ID, DmConfigSchema, DmPolicySchema, GROUP_POLICY_BLOCKED_LABEL, GroupPolicySchema, MarkdownConfigSchema, PAIRING_APPROVED_MESSAGE, ReplyRuntimeConfigSchemaShape, ToolPolicySchema, addWildcardAllowFrom, buildBaseAccountStatusSnapshot, buildBaseChannelStatusSummary, buildChannelConfigSchema, createAccountListHelpers, createLoggerBackedRuntime, createNormalizedOutboundDeliverer, createReplyPrefixOptions, createScopedPairingAccess, deleteAccountFromConfigSection, dispatchInboundReplyWithBase, emptyPluginConfigSchema, formatDocsLink, formatPairingApproveHint, formatTextWithAttachmentLinks, getChatChannelMeta, isDangerousNameMatchingEnabled, issuePairingChallenge, logInboundDrop, normalizeResolvedSecretInputString, promptAccountId, promptChannelAccessConfig, readStoreAllowFromForDmPolicy, requireOpenAllowFrom, resolveAccountIdForConfigure, resolveAllowlistProviderRuntimeGroupPolicy, resolveControlCommandGate, resolveDefaultGroupPolicy, resolveEffectiveAllowFromLists, resolveOutboundMediaUrls, setAccountEnabledInConfigSection, setTopLevelChannelAllowFrom, setTopLevelChannelDmPolicyWithAllowFrom, warnMissingProviderGroupPolicyFallbackOnce };
