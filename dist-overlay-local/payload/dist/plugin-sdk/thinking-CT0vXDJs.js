import { p as normalizeAccountId } from "./session-key-C_0eELjb.js";
import { r as resolveWhatsAppAccount } from "./accounts-B4AwEIkX.js";
import { D as resolveSlackAccount, F as resolveDiscordAccount, O as resolveSlackReplyToMode, S as resolveTelegramAccount, _ as normalizeWhatsAppTarget } from "./plugins-DibeMwuf.js";
import { A as normalizeE164, T as escapeRegExp, i as getChatChannelMeta, l as requireActivePluginRegistry, n as CHAT_CHANNEL_ORDER } from "./registry-BODM0liu.js";
import { r as resolveIMessageAccount } from "./accounts-Ca1fjBtk.js";
import { i as resolveSignalAccount } from "./accounts-RCIdUtOX.js";

//#region src/config/group-policy.ts
function resolveChannelGroupConfig(groups, groupId, caseInsensitive = false) {
	if (!groups) return;
	const direct = groups[groupId];
	if (direct) return direct;
	if (!caseInsensitive) return;
	const target = groupId.toLowerCase();
	const matchedKey = Object.keys(groups).find((key) => key !== "*" && key.toLowerCase() === target);
	if (!matchedKey) return;
	return groups[matchedKey];
}
function normalizeSenderKey(value) {
	const trimmed = value.trim();
	if (!trimmed) return "";
	return (trimmed.startsWith("@") ? trimmed.slice(1) : trimmed).toLowerCase();
}
function resolveToolsBySender(params) {
	const toolsBySender = params.toolsBySender;
	if (!toolsBySender) return;
	const entries = Object.entries(toolsBySender);
	if (entries.length === 0) return;
	const normalized = /* @__PURE__ */ new Map();
	let wildcard;
	for (const [rawKey, policy] of entries) {
		if (!policy) continue;
		const key = normalizeSenderKey(rawKey);
		if (!key) continue;
		if (key === "*") {
			wildcard = policy;
			continue;
		}
		if (!normalized.has(key)) normalized.set(key, policy);
	}
	const candidates = [];
	const pushCandidate = (value) => {
		const trimmed = value?.trim();
		if (!trimmed) return;
		candidates.push(trimmed);
	};
	pushCandidate(params.senderId);
	pushCandidate(params.senderE164);
	pushCandidate(params.senderUsername);
	pushCandidate(params.senderName);
	for (const candidate of candidates) {
		const key = normalizeSenderKey(candidate);
		if (!key) continue;
		const match = normalized.get(key);
		if (match) return match;
	}
	return wildcard;
}
function resolveChannelGroups(cfg, channel, accountId) {
	const normalizedAccountId = normalizeAccountId(accountId);
	const channelConfig = cfg.channels?.[channel];
	if (!channelConfig) return;
	return channelConfig.accounts?.[normalizedAccountId]?.groups ?? channelConfig.accounts?.[Object.keys(channelConfig.accounts ?? {}).find((key) => key.toLowerCase() === normalizedAccountId.toLowerCase()) ?? ""]?.groups ?? channelConfig.groups;
}
function resolveChannelGroupPolicy(params) {
	const { cfg, channel } = params;
	const groups = resolveChannelGroups(cfg, channel, params.accountId);
	const allowlistEnabled = Boolean(groups && Object.keys(groups).length > 0);
	const normalizedId = params.groupId?.trim();
	const groupConfig = normalizedId ? resolveChannelGroupConfig(groups, normalizedId, params.groupIdCaseInsensitive) : void 0;
	const defaultConfig = groups?.["*"];
	return {
		allowlistEnabled,
		allowed: !allowlistEnabled || allowlistEnabled && Boolean(groups && Object.hasOwn(groups, "*")) || Boolean(groupConfig),
		groupConfig,
		defaultConfig
	};
}
function resolveChannelGroupRequireMention(params) {
	const { requireMentionOverride, overrideOrder = "after-config" } = params;
	const { groupConfig, defaultConfig } = resolveChannelGroupPolicy(params);
	const configMention = typeof groupConfig?.requireMention === "boolean" ? groupConfig.requireMention : typeof defaultConfig?.requireMention === "boolean" ? defaultConfig.requireMention : void 0;
	if (overrideOrder === "before-config" && typeof requireMentionOverride === "boolean") return requireMentionOverride;
	if (typeof configMention === "boolean") return configMention;
	if (overrideOrder !== "before-config" && typeof requireMentionOverride === "boolean") return requireMentionOverride;
	return true;
}
function resolveChannelGroupToolsPolicy(params) {
	const { groupConfig, defaultConfig } = resolveChannelGroupPolicy(params);
	const groupSenderPolicy = resolveToolsBySender({
		toolsBySender: groupConfig?.toolsBySender,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	});
	if (groupSenderPolicy) return groupSenderPolicy;
	if (groupConfig?.tools) return groupConfig.tools;
	const defaultSenderPolicy = resolveToolsBySender({
		toolsBySender: defaultConfig?.toolsBySender,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	});
	if (defaultSenderPolicy) return defaultSenderPolicy;
	if (defaultConfig?.tools) return defaultConfig.tools;
}

//#endregion
//#region src/slack/threading-tool-context.ts
function buildSlackThreadingToolContext(params) {
	const configuredReplyToMode = resolveSlackReplyToMode(resolveSlackAccount({
		cfg: params.cfg,
		accountId: params.accountId
	}), params.context.ChatType);
	const effectiveReplyToMode = params.context.ThreadLabel ? "all" : configuredReplyToMode;
	const threadId = params.context.MessageThreadId ?? params.context.ReplyToId;
	return {
		currentChannelId: params.context.To?.startsWith("channel:") ? params.context.To.slice(8) : void 0,
		currentThreadTs: threadId != null ? String(threadId) : void 0,
		replyToMode: effectiveReplyToMode,
		hasRepliedRef: params.hasRepliedRef
	};
}

//#endregion
//#region src/shared/string-normalization.ts
function normalizeStringEntries(list) {
	return (list ?? []).map((entry) => String(entry).trim()).filter(Boolean);
}
function normalizeStringEntriesLower(list) {
	return normalizeStringEntries(list).map((entry) => entry.toLowerCase());
}
function normalizeHyphenSlug(raw) {
	const trimmed = raw?.trim().toLowerCase() ?? "";
	if (!trimmed) return "";
	return trimmed.replace(/\s+/g, "-").replace(/[^a-z0-9#@._+-]+/g, "-").replace(/-{2,}/g, "-").replace(/^[-.]+|[-.]+$/g, "");
}
function normalizeAtHashSlug(raw) {
	const trimmed = raw?.trim().toLowerCase() ?? "";
	if (!trimmed) return "";
	return trimmed.replace(/^[@#]+/, "").replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]+/g, "-").replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "");
}

//#endregion
//#region src/channels/plugins/group-mentions.ts
function normalizeDiscordSlug(value) {
	return normalizeAtHashSlug(value);
}
function parseTelegramGroupId(value) {
	const raw = value?.trim() ?? "";
	if (!raw) return {
		chatId: void 0,
		topicId: void 0
	};
	const parts = raw.split(":").filter(Boolean);
	if (parts.length >= 3 && parts[1] === "topic" && /^-?\d+$/.test(parts[0]) && /^\d+$/.test(parts[2])) return {
		chatId: parts[0],
		topicId: parts[2]
	};
	if (parts.length >= 2 && /^-?\d+$/.test(parts[0]) && /^\d+$/.test(parts[1])) return {
		chatId: parts[0],
		topicId: parts[1]
	};
	return {
		chatId: raw,
		topicId: void 0
	};
}
function resolveTelegramRequireMention(params) {
	const { cfg, chatId, topicId } = params;
	if (!chatId) return;
	const groupConfig = cfg.channels?.telegram?.groups?.[chatId];
	const groupDefault = cfg.channels?.telegram?.groups?.["*"];
	const topicConfig = topicId && groupConfig?.topics ? groupConfig.topics[topicId] : void 0;
	const defaultTopicConfig = topicId && groupDefault?.topics ? groupDefault.topics[topicId] : void 0;
	if (typeof topicConfig?.requireMention === "boolean") return topicConfig.requireMention;
	if (typeof defaultTopicConfig?.requireMention === "boolean") return defaultTopicConfig.requireMention;
	if (typeof groupConfig?.requireMention === "boolean") return groupConfig.requireMention;
	if (typeof groupDefault?.requireMention === "boolean") return groupDefault.requireMention;
}
function resolveDiscordGuildEntry(guilds, groupSpace) {
	if (!guilds || Object.keys(guilds).length === 0) return null;
	const space = groupSpace?.trim() ?? "";
	if (space && guilds[space]) return guilds[space];
	const normalized = normalizeDiscordSlug(space);
	if (normalized && guilds[normalized]) return guilds[normalized];
	if (normalized) {
		const match = Object.values(guilds).find((entry) => normalizeDiscordSlug(entry?.slug ?? void 0) === normalized);
		if (match) return match;
	}
	return guilds["*"] ?? null;
}
function resolveDiscordChannelEntry(channelEntries, params) {
	if (!channelEntries || Object.keys(channelEntries).length === 0) return;
	const groupChannel = params.groupChannel;
	const channelSlug = normalizeDiscordSlug(groupChannel);
	return (params.groupId ? channelEntries[params.groupId] : void 0) ?? (channelSlug ? channelEntries[channelSlug] ?? channelEntries[`#${channelSlug}`] : void 0) ?? (groupChannel ? channelEntries[normalizeDiscordSlug(groupChannel)] : void 0);
}
function resolveSlackChannelPolicyEntry(params) {
	const channels = resolveSlackAccount({
		cfg: params.cfg,
		accountId: params.accountId
	}).channels ?? {};
	if (Object.keys(channels).length === 0) return;
	const channelId = params.groupId?.trim();
	const channelName = params.groupChannel?.replace(/^#/, "");
	const normalizedName = normalizeHyphenSlug(channelName);
	const candidates = [
		channelId ?? "",
		channelName ? `#${channelName}` : "",
		channelName ?? "",
		normalizedName
	].filter(Boolean);
	for (const candidate of candidates) if (candidate && channels[candidate]) return channels[candidate];
	return channels["*"];
}
function resolveTelegramGroupRequireMention(params) {
	const { chatId, topicId } = parseTelegramGroupId(params.groupId);
	const requireMention = resolveTelegramRequireMention({
		cfg: params.cfg,
		chatId,
		topicId
	});
	if (typeof requireMention === "boolean") return requireMention;
	return resolveChannelGroupRequireMention({
		cfg: params.cfg,
		channel: "telegram",
		groupId: chatId ?? params.groupId,
		accountId: params.accountId
	});
}
function resolveWhatsAppGroupRequireMention(params) {
	return resolveChannelGroupRequireMention({
		cfg: params.cfg,
		channel: "whatsapp",
		groupId: params.groupId,
		accountId: params.accountId
	});
}
function resolveIMessageGroupRequireMention(params) {
	return resolveChannelGroupRequireMention({
		cfg: params.cfg,
		channel: "imessage",
		groupId: params.groupId,
		accountId: params.accountId
	});
}
function resolveDiscordGroupRequireMention(params) {
	const guildEntry = resolveDiscordGuildEntry(params.cfg.channels?.discord?.guilds, params.groupSpace);
	const channelEntries = guildEntry?.channels;
	if (channelEntries && Object.keys(channelEntries).length > 0) {
		const entry = resolveDiscordChannelEntry(channelEntries, params);
		if (entry && typeof entry.requireMention === "boolean") return entry.requireMention;
	}
	if (typeof guildEntry?.requireMention === "boolean") return guildEntry.requireMention;
	return true;
}
function resolveGoogleChatGroupRequireMention(params) {
	return resolveChannelGroupRequireMention({
		cfg: params.cfg,
		channel: "googlechat",
		groupId: params.groupId,
		accountId: params.accountId
	});
}
function resolveGoogleChatGroupToolPolicy(params) {
	return resolveChannelGroupToolsPolicy({
		cfg: params.cfg,
		channel: "googlechat",
		groupId: params.groupId,
		accountId: params.accountId,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	});
}
function resolveSlackGroupRequireMention(params) {
	const resolved = resolveSlackChannelPolicyEntry(params);
	if (typeof resolved?.requireMention === "boolean") return resolved.requireMention;
	return true;
}
function resolveBlueBubblesGroupRequireMention(params) {
	return resolveChannelGroupRequireMention({
		cfg: params.cfg,
		channel: "bluebubbles",
		groupId: params.groupId,
		accountId: params.accountId
	});
}
function resolveTelegramGroupToolPolicy(params) {
	const { chatId } = parseTelegramGroupId(params.groupId);
	return resolveChannelGroupToolsPolicy({
		cfg: params.cfg,
		channel: "telegram",
		groupId: chatId ?? params.groupId,
		accountId: params.accountId,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	});
}
function resolveWhatsAppGroupToolPolicy(params) {
	return resolveChannelGroupToolsPolicy({
		cfg: params.cfg,
		channel: "whatsapp",
		groupId: params.groupId,
		accountId: params.accountId,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	});
}
function resolveIMessageGroupToolPolicy(params) {
	return resolveChannelGroupToolsPolicy({
		cfg: params.cfg,
		channel: "imessage",
		groupId: params.groupId,
		accountId: params.accountId,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	});
}
function resolveDiscordGroupToolPolicy(params) {
	const guildEntry = resolveDiscordGuildEntry(params.cfg.channels?.discord?.guilds, params.groupSpace);
	const channelEntries = guildEntry?.channels;
	if (channelEntries && Object.keys(channelEntries).length > 0) {
		const entry = resolveDiscordChannelEntry(channelEntries, params);
		const senderPolicy = resolveToolsBySender({
			toolsBySender: entry?.toolsBySender,
			senderId: params.senderId,
			senderName: params.senderName,
			senderUsername: params.senderUsername,
			senderE164: params.senderE164
		});
		if (senderPolicy) return senderPolicy;
		if (entry?.tools) return entry.tools;
	}
	const guildSenderPolicy = resolveToolsBySender({
		toolsBySender: guildEntry?.toolsBySender,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	});
	if (guildSenderPolicy) return guildSenderPolicy;
	if (guildEntry?.tools) return guildEntry.tools;
}
function resolveSlackGroupToolPolicy(params) {
	const resolved = resolveSlackChannelPolicyEntry(params);
	if (!resolved) return;
	const senderPolicy = resolveToolsBySender({
		toolsBySender: resolved?.toolsBySender,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	});
	if (senderPolicy) return senderPolicy;
	if (resolved?.tools) return resolved.tools;
}
function resolveBlueBubblesGroupToolPolicy(params) {
	return resolveChannelGroupToolsPolicy({
		cfg: params.cfg,
		channel: "bluebubbles",
		groupId: params.groupId,
		accountId: params.accountId,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	});
}

//#endregion
//#region src/channels/plugins/normalize/signal.ts
function normalizeSignalMessagingTarget(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return;
	let normalized = trimmed;
	if (normalized.toLowerCase().startsWith("signal:")) normalized = normalized.slice(7).trim();
	if (!normalized) return;
	const lower = normalized.toLowerCase();
	if (lower.startsWith("group:")) {
		const id = normalized.slice(6).trim();
		return id ? `group:${id}` : void 0;
	}
	if (lower.startsWith("username:")) {
		const id = normalized.slice(9).trim();
		return id ? `username:${id}`.toLowerCase() : void 0;
	}
	if (lower.startsWith("u:")) {
		const id = normalized.slice(2).trim();
		return id ? `username:${id}`.toLowerCase() : void 0;
	}
	if (lower.startsWith("uuid:")) {
		const id = normalized.slice(5).trim();
		return id ? id.toLowerCase() : void 0;
	}
	return normalized.toLowerCase();
}
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UUID_COMPACT_PATTERN = /^[0-9a-f]{32}$/i;
function looksLikeSignalTargetId(raw, normalized) {
	const candidates = [raw, normalized ?? ""].map((value) => value.trim()).filter(Boolean);
	for (const candidate of candidates) {
		if (/^(signal:)?(group:|username:|u:)/i.test(candidate)) return true;
		if (/^(signal:)?uuid:/i.test(candidate)) {
			const stripped = candidate.replace(/^signal:/i, "").replace(/^uuid:/i, "").trim();
			if (!stripped) continue;
			if (UUID_PATTERN.test(stripped) || UUID_COMPACT_PATTERN.test(stripped)) return true;
			continue;
		}
		const withoutSignalPrefix = candidate.replace(/^signal:/i, "").trim();
		if (UUID_PATTERN.test(withoutSignalPrefix) || UUID_COMPACT_PATTERN.test(withoutSignalPrefix)) return true;
		if (/^\+?\d{3,}$/.test(withoutSignalPrefix)) return true;
	}
	return false;
}

//#endregion
//#region src/channels/dock.ts
const formatLower = (allowFrom) => allowFrom.map((entry) => String(entry).trim()).filter(Boolean).map((entry) => entry.toLowerCase());
const formatDiscordAllowFrom = (allowFrom) => allowFrom.map((entry) => String(entry).trim().replace(/^<@!?/, "").replace(/>$/, "").replace(/^discord:/i, "").replace(/^user:/i, "").replace(/^pk:/i, "").trim().toLowerCase()).filter(Boolean);
function resolveDirectOrGroupChannelId(context) {
	return (context.ChatType?.toLowerCase() === "direct" ? context.From ?? context.To : context.To)?.trim() || void 0;
}
function buildSignalThreadToolContext(params) {
	const currentChannelIdRaw = resolveDirectOrGroupChannelId(params.context);
	return {
		currentChannelId: currentChannelIdRaw ? normalizeSignalMessagingTarget(currentChannelIdRaw) ?? currentChannelIdRaw.trim() : void 0,
		currentThreadTs: params.context.ReplyToId,
		hasRepliedRef: params.hasRepliedRef
	};
}
function buildIMessageThreadToolContext(params) {
	return {
		currentChannelId: resolveDirectOrGroupChannelId(params.context),
		currentThreadTs: params.context.ReplyToId,
		hasRepliedRef: params.hasRepliedRef
	};
}
function resolveCaseInsensitiveAccount(accounts, accountId) {
	if (!accounts) return;
	const normalized = normalizeAccountId(accountId);
	return accounts[normalized] ?? accounts[Object.keys(accounts).find((key) => key.toLowerCase() === normalized.toLowerCase()) ?? ""];
}
const DOCKS = {
	telegram: {
		id: "telegram",
		capabilities: {
			chatTypes: [
				"direct",
				"group",
				"channel",
				"thread"
			],
			nativeCommands: true,
			blockStreaming: true
		},
		outbound: { textChunkLimit: 4e3 },
		config: {
			resolveAllowFrom: ({ cfg, accountId }) => (resolveTelegramAccount({
				cfg,
				accountId
			}).config.allowFrom ?? []).map((entry) => String(entry)),
			formatAllowFrom: ({ allowFrom }) => allowFrom.map((entry) => String(entry).trim()).filter(Boolean).map((entry) => entry.replace(/^(telegram|tg):/i, "")).map((entry) => entry.toLowerCase()),
			resolveDefaultTo: ({ cfg, accountId }) => {
				const val = resolveTelegramAccount({
					cfg,
					accountId
				}).config.defaultTo;
				return val != null ? String(val) : void 0;
			}
		},
		groups: {
			resolveRequireMention: resolveTelegramGroupRequireMention,
			resolveToolPolicy: resolveTelegramGroupToolPolicy
		},
		threading: {
			resolveReplyToMode: ({ cfg }) => cfg.channels?.telegram?.replyToMode ?? "off",
			buildToolContext: ({ context, hasRepliedRef }) => {
				const threadId = context.MessageThreadId ?? context.ReplyToId;
				return {
					currentChannelId: context.To?.trim() || void 0,
					currentThreadTs: threadId != null ? String(threadId) : void 0,
					hasRepliedRef
				};
			}
		}
	},
	whatsapp: {
		id: "whatsapp",
		capabilities: {
			chatTypes: ["direct", "group"],
			polls: true,
			reactions: true,
			media: true
		},
		commands: {
			enforceOwnerForCommands: true,
			skipWhenConfigEmpty: true
		},
		outbound: { textChunkLimit: 4e3 },
		config: {
			resolveAllowFrom: ({ cfg, accountId }) => resolveWhatsAppAccount({
				cfg,
				accountId
			}).allowFrom ?? [],
			formatAllowFrom: ({ allowFrom }) => allowFrom.map((entry) => String(entry).trim()).filter((entry) => Boolean(entry)).map((entry) => entry === "*" ? entry : normalizeWhatsAppTarget(entry)).filter((entry) => Boolean(entry)),
			resolveDefaultTo: ({ cfg, accountId }) => {
				const root = cfg.channels?.whatsapp;
				const normalized = normalizeAccountId(accountId);
				return ((root?.accounts?.[normalized])?.defaultTo ?? root?.defaultTo)?.trim() || void 0;
			}
		},
		groups: {
			resolveRequireMention: resolveWhatsAppGroupRequireMention,
			resolveToolPolicy: resolveWhatsAppGroupToolPolicy,
			resolveGroupIntroHint: () => "WhatsApp IDs: SenderId is the participant JID (group participant id)."
		},
		mentions: { stripPatterns: ({ ctx }) => {
			const selfE164 = (ctx.To ?? "").replace(/^whatsapp:/, "");
			if (!selfE164) return [];
			const escaped = escapeRegExp(selfE164);
			return [escaped, `@${escaped}`];
		} },
		threading: { buildToolContext: ({ context, hasRepliedRef }) => {
			return {
				currentChannelId: context.From?.trim() || context.To?.trim() || void 0,
				currentThreadTs: context.ReplyToId,
				hasRepliedRef
			};
		} }
	},
	discord: {
		id: "discord",
		capabilities: {
			chatTypes: [
				"direct",
				"channel",
				"thread"
			],
			polls: true,
			reactions: true,
			media: true,
			nativeCommands: true,
			threads: true
		},
		outbound: { textChunkLimit: 2e3 },
		streaming: { blockStreamingCoalesceDefaults: {
			minChars: 1500,
			idleMs: 1e3
		} },
		elevated: { allowFromFallback: ({ cfg }) => cfg.channels?.discord?.allowFrom ?? cfg.channels?.discord?.dm?.allowFrom },
		config: {
			resolveAllowFrom: ({ cfg, accountId }) => {
				const account = resolveDiscordAccount({
					cfg,
					accountId
				});
				return (account.config.allowFrom ?? account.config.dm?.allowFrom ?? []).map((entry) => String(entry));
			},
			formatAllowFrom: ({ allowFrom }) => formatDiscordAllowFrom(allowFrom),
			resolveDefaultTo: ({ cfg, accountId }) => resolveDiscordAccount({
				cfg,
				accountId
			}).config.defaultTo?.trim() || void 0
		},
		groups: {
			resolveRequireMention: resolveDiscordGroupRequireMention,
			resolveToolPolicy: resolveDiscordGroupToolPolicy
		},
		mentions: { stripPatterns: () => ["<@!?\\d+>"] },
		threading: {
			resolveReplyToMode: ({ cfg }) => cfg.channels?.discord?.replyToMode ?? "off",
			buildToolContext: ({ context, hasRepliedRef }) => ({
				currentChannelId: context.To?.trim() || void 0,
				currentThreadTs: context.ReplyToId,
				hasRepliedRef
			})
		}
	},
	irc: {
		id: "irc",
		capabilities: {
			chatTypes: ["direct", "group"],
			media: true,
			blockStreaming: true
		},
		outbound: { textChunkLimit: 350 },
		streaming: { blockStreamingCoalesceDefaults: {
			minChars: 300,
			idleMs: 1e3
		} },
		config: {
			resolveAllowFrom: ({ cfg, accountId }) => {
				const channel = cfg.channels?.irc;
				return (resolveCaseInsensitiveAccount(channel?.accounts, accountId)?.allowFrom ?? channel?.allowFrom ?? []).map((entry) => String(entry));
			},
			formatAllowFrom: ({ allowFrom }) => allowFrom.map((entry) => String(entry).trim()).filter(Boolean).map((entry) => entry.replace(/^irc:/i, "").replace(/^user:/i, "").toLowerCase()),
			resolveDefaultTo: ({ cfg, accountId }) => {
				const channel = cfg.channels?.irc;
				const normalized = normalizeAccountId(accountId);
				return ((channel?.accounts?.[normalized] ?? channel?.accounts?.[Object.keys(channel?.accounts ?? {}).find((key) => key.toLowerCase() === normalized.toLowerCase()) ?? ""])?.defaultTo ?? channel?.defaultTo)?.trim() || void 0;
			}
		},
		groups: {
			resolveRequireMention: ({ cfg, accountId, groupId }) => {
				if (!groupId) return true;
				return resolveChannelGroupRequireMention({
					cfg,
					channel: "irc",
					groupId,
					accountId,
					groupIdCaseInsensitive: true
				});
			},
			resolveToolPolicy: ({ cfg, accountId, groupId, senderId, senderName, senderUsername }) => {
				if (!groupId) return;
				return resolveChannelGroupToolsPolicy({
					cfg,
					channel: "irc",
					groupId,
					accountId,
					groupIdCaseInsensitive: true,
					senderId,
					senderName,
					senderUsername
				});
			}
		}
	},
	googlechat: {
		id: "googlechat",
		capabilities: {
			chatTypes: [
				"direct",
				"group",
				"thread"
			],
			reactions: true,
			media: true,
			threads: true,
			blockStreaming: true
		},
		outbound: { textChunkLimit: 4e3 },
		config: {
			resolveAllowFrom: ({ cfg, accountId }) => {
				const channel = cfg.channels?.googlechat;
				return (resolveCaseInsensitiveAccount(channel?.accounts, accountId)?.dm?.allowFrom ?? channel?.dm?.allowFrom ?? []).map((entry) => String(entry));
			},
			formatAllowFrom: ({ allowFrom }) => allowFrom.map((entry) => String(entry).trim()).filter(Boolean).map((entry) => entry.replace(/^(googlechat|google-chat|gchat):/i, "").replace(/^user:/i, "").replace(/^users\//i, "").toLowerCase()),
			resolveDefaultTo: ({ cfg, accountId }) => {
				const channel = cfg.channels?.googlechat;
				const normalized = normalizeAccountId(accountId);
				return ((channel?.accounts?.[normalized] ?? channel?.accounts?.[Object.keys(channel?.accounts ?? {}).find((key) => key.toLowerCase() === normalized.toLowerCase()) ?? ""])?.defaultTo ?? channel?.defaultTo)?.trim() || void 0;
			}
		},
		groups: {
			resolveRequireMention: resolveGoogleChatGroupRequireMention,
			resolveToolPolicy: resolveGoogleChatGroupToolPolicy
		},
		threading: {
			resolveReplyToMode: ({ cfg }) => cfg.channels?.googlechat?.replyToMode ?? "off",
			buildToolContext: ({ context, hasRepliedRef }) => {
				const threadId = context.MessageThreadId ?? context.ReplyToId;
				return {
					currentChannelId: context.To?.trim() || void 0,
					currentThreadTs: threadId != null ? String(threadId) : void 0,
					hasRepliedRef
				};
			}
		}
	},
	slack: {
		id: "slack",
		capabilities: {
			chatTypes: [
				"direct",
				"channel",
				"thread"
			],
			reactions: true,
			media: true,
			nativeCommands: true,
			threads: true
		},
		outbound: { textChunkLimit: 4e3 },
		streaming: { blockStreamingCoalesceDefaults: {
			minChars: 1500,
			idleMs: 1e3
		} },
		config: {
			resolveAllowFrom: ({ cfg, accountId }) => {
				const account = resolveSlackAccount({
					cfg,
					accountId
				});
				return (account.config.allowFrom ?? account.dm?.allowFrom ?? []).map((entry) => String(entry));
			},
			formatAllowFrom: ({ allowFrom }) => formatLower(allowFrom),
			resolveDefaultTo: ({ cfg, accountId }) => resolveSlackAccount({
				cfg,
				accountId
			}).config.defaultTo?.trim() || void 0
		},
		groups: {
			resolveRequireMention: resolveSlackGroupRequireMention,
			resolveToolPolicy: resolveSlackGroupToolPolicy
		},
		mentions: { stripPatterns: () => ["<@[^>]+>"] },
		threading: {
			resolveReplyToMode: ({ cfg, accountId, chatType }) => resolveSlackReplyToMode(resolveSlackAccount({
				cfg,
				accountId
			}), chatType),
			allowExplicitReplyTagsWhenOff: true,
			buildToolContext: (params) => buildSlackThreadingToolContext(params)
		}
	},
	signal: {
		id: "signal",
		capabilities: {
			chatTypes: ["direct", "group"],
			reactions: true,
			media: true
		},
		outbound: { textChunkLimit: 4e3 },
		streaming: { blockStreamingCoalesceDefaults: {
			minChars: 1500,
			idleMs: 1e3
		} },
		config: {
			resolveAllowFrom: ({ cfg, accountId }) => (resolveSignalAccount({
				cfg,
				accountId
			}).config.allowFrom ?? []).map((entry) => String(entry)),
			formatAllowFrom: ({ allowFrom }) => allowFrom.map((entry) => String(entry).trim()).filter(Boolean).map((entry) => entry === "*" ? "*" : normalizeE164(entry.replace(/^signal:/i, ""))).filter(Boolean),
			resolveDefaultTo: ({ cfg, accountId }) => resolveSignalAccount({
				cfg,
				accountId
			}).config.defaultTo?.trim() || void 0
		},
		threading: { buildToolContext: ({ context, hasRepliedRef }) => buildSignalThreadToolContext({
			context,
			hasRepliedRef
		}) }
	},
	imessage: {
		id: "imessage",
		capabilities: {
			chatTypes: ["direct", "group"],
			reactions: true,
			media: true
		},
		outbound: { textChunkLimit: 4e3 },
		config: {
			resolveAllowFrom: ({ cfg, accountId }) => (resolveIMessageAccount({
				cfg,
				accountId
			}).config.allowFrom ?? []).map((entry) => String(entry)),
			formatAllowFrom: ({ allowFrom }) => allowFrom.map((entry) => String(entry).trim()).filter(Boolean),
			resolveDefaultTo: ({ cfg, accountId }) => resolveIMessageAccount({
				cfg,
				accountId
			}).config.defaultTo?.trim() || void 0
		},
		groups: {
			resolveRequireMention: resolveIMessageGroupRequireMention,
			resolveToolPolicy: resolveIMessageGroupToolPolicy
		},
		threading: { buildToolContext: ({ context, hasRepliedRef }) => buildIMessageThreadToolContext({
			context,
			hasRepliedRef
		}) }
	}
};
function buildDockFromPlugin(plugin) {
	return {
		id: plugin.id,
		capabilities: plugin.capabilities,
		commands: plugin.commands,
		outbound: plugin.outbound?.textChunkLimit ? { textChunkLimit: plugin.outbound.textChunkLimit } : void 0,
		streaming: plugin.streaming ? { blockStreamingCoalesceDefaults: plugin.streaming.blockStreamingCoalesceDefaults } : void 0,
		elevated: plugin.elevated,
		config: plugin.config ? {
			resolveAllowFrom: plugin.config.resolveAllowFrom,
			formatAllowFrom: plugin.config.formatAllowFrom,
			resolveDefaultTo: plugin.config.resolveDefaultTo
		} : void 0,
		groups: plugin.groups,
		mentions: plugin.mentions,
		threading: plugin.threading,
		agentPrompt: plugin.agentPrompt
	};
}
function listPluginDockEntries() {
	const registry = requireActivePluginRegistry();
	const entries = [];
	const seen = /* @__PURE__ */ new Set();
	for (const entry of registry.channels) {
		const plugin = entry.plugin;
		const id = String(plugin.id).trim();
		if (!id || seen.has(id)) continue;
		seen.add(id);
		if (CHAT_CHANNEL_ORDER.includes(plugin.id)) continue;
		const dock = entry.dock ?? buildDockFromPlugin(plugin);
		entries.push({
			id: plugin.id,
			dock,
			order: plugin.meta.order
		});
	}
	return entries;
}
function listChannelDocks() {
	const baseEntries = CHAT_CHANNEL_ORDER.map((id) => ({
		id,
		dock: DOCKS[id],
		order: getChatChannelMeta(id).order
	}));
	const pluginEntries = listPluginDockEntries();
	const combined = [...baseEntries, ...pluginEntries];
	combined.sort((a, b) => {
		const indexA = CHAT_CHANNEL_ORDER.indexOf(a.id);
		const indexB = CHAT_CHANNEL_ORDER.indexOf(b.id);
		const orderA = a.order ?? (indexA === -1 ? 999 : indexA);
		const orderB = b.order ?? (indexB === -1 ? 999 : indexB);
		if (orderA !== orderB) return orderA - orderB;
		return String(a.id).localeCompare(String(b.id));
	});
	return combined.map((entry) => entry.dock);
}
function getChannelDock(id) {
	const core = DOCKS[id];
	if (core) return core;
	const pluginEntry = requireActivePluginRegistry().channels.find((entry) => entry.plugin.id === id);
	if (!pluginEntry) return;
	return pluginEntry.dock ?? buildDockFromPlugin(pluginEntry.plugin);
}

//#endregion
//#region src/auto-reply/thinking.ts
function normalizeProviderId(provider) {
	if (!provider) return "";
	const normalized = provider.trim().toLowerCase();
	if (normalized === "z.ai" || normalized === "z-ai") return "zai";
	return normalized;
}
function isBinaryThinkingProvider(provider) {
	return normalizeProviderId(provider) === "zai";
}
const XHIGH_MODEL_REFS = [
	"openai/gpt-5.2",
	"openai-codex/gpt-5.3-codex",
	"openai-codex/gpt-5.3-codex-spark",
	"openai-codex/gpt-5.2-codex",
	"openai-codex/gpt-5.1-codex",
	"github-copilot/gpt-5.2-codex",
	"github-copilot/gpt-5.2"
];
const XHIGH_MODEL_SET = new Set(XHIGH_MODEL_REFS.map((entry) => entry.toLowerCase()));
const XHIGH_MODEL_IDS = new Set(XHIGH_MODEL_REFS.map((entry) => entry.split("/")[1]?.toLowerCase()).filter((entry) => Boolean(entry)));
function normalizeThinkLevel(raw) {
	if (!raw) return;
	const key = raw.trim().toLowerCase();
	const collapsed = key.replace(/[\s_-]+/g, "");
	if (collapsed === "xhigh" || collapsed === "extrahigh") return "xhigh";
	if (["off"].includes(key)) return "off";
	if ([
		"on",
		"enable",
		"enabled"
	].includes(key)) return "low";
	if (["min", "minimal"].includes(key)) return "minimal";
	if ([
		"low",
		"thinkhard",
		"think-hard",
		"think_hard"
	].includes(key)) return "low";
	if ([
		"mid",
		"med",
		"medium",
		"thinkharder",
		"think-harder",
		"harder"
	].includes(key)) return "medium";
	if ([
		"high",
		"ultra",
		"ultrathink",
		"think-hard",
		"thinkhardest",
		"highest",
		"max"
	].includes(key)) return "high";
	if (["think"].includes(key)) return "minimal";
}
function supportsXHighThinking(provider, model) {
	const modelKey = model?.trim().toLowerCase();
	if (!modelKey) return false;
	const providerKey = provider?.trim().toLowerCase();
	if (providerKey) return XHIGH_MODEL_SET.has(`${providerKey}/${modelKey}`);
	return XHIGH_MODEL_IDS.has(modelKey);
}
function listThinkingLevels(provider, model) {
	const levels = [
		"off",
		"minimal",
		"low",
		"medium",
		"high"
	];
	if (supportsXHighThinking(provider, model)) levels.push("xhigh");
	return levels;
}
function listThinkingLevelLabels(provider, model) {
	if (isBinaryThinkingProvider(provider)) return ["off", "on"];
	return listThinkingLevels(provider, model);
}
function formatThinkingLevels(provider, model, separator = ", ") {
	return listThinkingLevelLabels(provider, model).join(separator);
}
function formatXHighModelHint() {
	const refs = [...XHIGH_MODEL_REFS];
	if (refs.length === 0) return "unknown model";
	if (refs.length === 1) return refs[0];
	if (refs.length === 2) return `${refs[0]} or ${refs[1]}`;
	return `${refs.slice(0, -1).join(", ")} or ${refs[refs.length - 1]}`;
}
function normalizeOnOffFullLevel(raw) {
	if (!raw) return;
	const key = raw.toLowerCase();
	if ([
		"off",
		"false",
		"no",
		"0"
	].includes(key)) return "off";
	if ([
		"full",
		"all",
		"everything"
	].includes(key)) return "full";
	if ([
		"on",
		"minimal",
		"true",
		"yes",
		"1"
	].includes(key)) return "on";
}
function normalizeVerboseLevel(raw) {
	return normalizeOnOffFullLevel(raw);
}
function normalizeUsageDisplay(raw) {
	if (!raw) return;
	const key = raw.toLowerCase();
	if ([
		"off",
		"false",
		"no",
		"0",
		"disable",
		"disabled"
	].includes(key)) return "off";
	if ([
		"on",
		"true",
		"yes",
		"1",
		"enable",
		"enabled"
	].includes(key)) return "tokens";
	if ([
		"tokens",
		"token",
		"tok",
		"minimal",
		"min"
	].includes(key)) return "tokens";
	if (["full", "session"].includes(key)) return "full";
}
function resolveResponseUsageMode(raw) {
	return normalizeUsageDisplay(raw) ?? "off";
}
function normalizeElevatedLevel(raw) {
	if (!raw) return;
	const key = raw.toLowerCase();
	if ([
		"off",
		"false",
		"no",
		"0"
	].includes(key)) return "off";
	if ([
		"full",
		"auto",
		"auto-approve",
		"autoapprove"
	].includes(key)) return "full";
	if ([
		"ask",
		"prompt",
		"approval",
		"approve"
	].includes(key)) return "ask";
	if ([
		"on",
		"true",
		"yes",
		"1"
	].includes(key)) return "on";
}
function normalizeReasoningLevel(raw) {
	if (!raw) return;
	const key = raw.toLowerCase();
	if ([
		"off",
		"false",
		"no",
		"0",
		"hide",
		"hidden",
		"disable",
		"disabled"
	].includes(key)) return "off";
	if ([
		"on",
		"true",
		"yes",
		"1",
		"show",
		"visible",
		"enable",
		"enabled"
	].includes(key)) return "on";
	if ([
		"stream",
		"streaming",
		"draft",
		"live"
	].includes(key)) return "stream";
}

//#endregion
export { normalizeHyphenSlug as A, resolveSlackGroupRequireMention as C, resolveWhatsAppGroupRequireMention as D, resolveTelegramGroupToolPolicy as E, resolveChannelGroupRequireMention as F, resolveChannelGroupToolsPolicy as I, resolveToolsBySender as L, normalizeStringEntriesLower as M, buildSlackThreadingToolContext as N, resolveWhatsAppGroupToolPolicy as O, resolveChannelGroupPolicy as P, resolveIMessageGroupToolPolicy as S, resolveTelegramGroupRequireMention as T, resolveDiscordGroupRequireMention as _, normalizeReasoningLevel as a, resolveGoogleChatGroupToolPolicy as b, normalizeVerboseLevel as c, getChannelDock as d, listChannelDocks as f, resolveBlueBubblesGroupToolPolicy as g, resolveBlueBubblesGroupRequireMention as h, normalizeElevatedLevel as i, normalizeStringEntries as j, normalizeAtHashSlug as k, resolveResponseUsageMode as l, normalizeSignalMessagingTarget as m, formatXHighModelHint as n, normalizeThinkLevel as o, looksLikeSignalTargetId as p, listThinkingLevels as r, normalizeUsageDisplay as s, formatThinkingLevels as t, supportsXHighThinking as u, resolveDiscordGroupToolPolicy as v, resolveSlackGroupToolPolicy as w, resolveIMessageGroupRequireMention as x, resolveGoogleChatGroupRequireMention as y };