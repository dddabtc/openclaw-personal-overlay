import { lookup } from "node:dns";
import { lookup as lookup$1 } from "node:dns/promises";
import { Agent } from "undici";

//#region src/infra/net/hostname.ts
function normalizeHostname(hostname) {
	const normalized = hostname.trim().toLowerCase().replace(/\.$/, "");
	if (normalized.startsWith("[") && normalized.endsWith("]")) return normalized.slice(1, -1);
	return normalized;
}

//#endregion
//#region src/infra/net/ssrf.ts
var SsrFBlockedError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "SsrFBlockedError";
	}
};
const BLOCKED_HOSTNAMES = new Set([
	"localhost",
	"localhost.localdomain",
	"metadata.google.internal"
]);
function normalizeHostnameSet(values) {
	if (!values || values.length === 0) return /* @__PURE__ */ new Set();
	return new Set(values.map((value) => normalizeHostname(value)).filter(Boolean));
}
function normalizeHostnameAllowlist(values) {
	if (!values || values.length === 0) return [];
	return Array.from(new Set(values.map((value) => normalizeHostname(value)).filter((value) => value !== "*" && value !== "*." && value.length > 0)));
}
function isHostnameAllowedByPattern(hostname, pattern) {
	if (pattern.startsWith("*.")) {
		const suffix = pattern.slice(2);
		if (!suffix || hostname === suffix) return false;
		return hostname.endsWith(`.${suffix}`);
	}
	return hostname === pattern;
}
function matchesHostnameAllowlist(hostname, allowlist) {
	if (allowlist.length === 0) return true;
	return allowlist.some((pattern) => isHostnameAllowedByPattern(hostname, pattern));
}
function parseStrictIpv4Octet(part) {
	if (!/^[0-9]+$/.test(part)) return null;
	const value = Number.parseInt(part, 10);
	if (Number.isNaN(value) || value < 0 || value > 255) return null;
	if (part !== String(value)) return null;
	return value;
}
function parseIpv4(address) {
	const parts = address.split(".");
	if (parts.length !== 4) return null;
	for (const part of parts) if (parseStrictIpv4Octet(part) === null) return null;
	return parts.map((part) => Number.parseInt(part, 10));
}
function classifyIpv4Part(part) {
	if (/^0x[0-9a-f]+$/i.test(part)) return "hex";
	if (/^0x/i.test(part)) return "invalid-hex";
	if (/^[0-9]+$/.test(part)) return "decimal";
	return "non-numeric";
}
function isUnsupportedLegacyIpv4Literal(address) {
	const parts = address.split(".");
	if (parts.length === 0 || parts.length > 4) return false;
	if (parts.some((part) => part.length === 0)) return true;
	const partKinds = parts.map(classifyIpv4Part);
	if (partKinds.some((kind) => kind === "non-numeric")) return false;
	if (partKinds.some((kind) => kind === "invalid-hex")) return true;
	if (parts.length !== 4) return true;
	for (const part of parts) {
		if (/^0x/i.test(part)) return true;
		const value = Number.parseInt(part, 10);
		if (Number.isNaN(value) || value > 255 || part !== String(value)) return true;
	}
	return false;
}
function stripIpv6ZoneId(address) {
	const index = address.indexOf("%");
	return index >= 0 ? address.slice(0, index) : address;
}
function parseIpv6Hextets(address) {
	let input = stripIpv6ZoneId(address.trim().toLowerCase());
	if (!input) return null;
	if (input.includes(".")) {
		const lastColon = input.lastIndexOf(":");
		if (lastColon < 0) return null;
		const ipv4 = parseIpv4(input.slice(lastColon + 1));
		if (!ipv4) return null;
		const high = (ipv4[0] << 8) + ipv4[1];
		const low = (ipv4[2] << 8) + ipv4[3];
		input = `${input.slice(0, lastColon)}:${high.toString(16)}:${low.toString(16)}`;
	}
	const doubleColonParts = input.split("::");
	if (doubleColonParts.length > 2) return null;
	const headParts = doubleColonParts[0]?.length > 0 ? doubleColonParts[0].split(":").filter(Boolean) : [];
	const tailParts = doubleColonParts.length === 2 && doubleColonParts[1]?.length > 0 ? doubleColonParts[1].split(":").filter(Boolean) : [];
	const missingParts = 8 - headParts.length - tailParts.length;
	if (missingParts < 0) return null;
	const fullParts = doubleColonParts.length === 1 ? input.split(":") : [
		...headParts,
		...Array.from({ length: missingParts }, () => "0"),
		...tailParts
	];
	if (fullParts.length !== 8) return null;
	const hextets = [];
	for (const part of fullParts) {
		if (!part) return null;
		const value = Number.parseInt(part, 16);
		if (Number.isNaN(value) || value < 0 || value > 65535) return null;
		hextets.push(value);
	}
	return hextets;
}
function decodeIpv4FromHextets(high, low) {
	return [
		high >>> 8 & 255,
		high & 255,
		low >>> 8 & 255,
		low & 255
	];
}
const EMBEDDED_IPV4_RULES = [
	{
		matches: (hextets) => hextets[0] === 0 && hextets[1] === 0 && hextets[2] === 0 && hextets[3] === 0 && hextets[4] === 0 && (hextets[5] === 65535 || hextets[5] === 0),
		extract: (hextets) => [hextets[6], hextets[7]]
	},
	{
		matches: (hextets) => hextets[0] === 100 && hextets[1] === 65435 && hextets[2] === 0 && hextets[3] === 0 && hextets[4] === 0 && hextets[5] === 0,
		extract: (hextets) => [hextets[6], hextets[7]]
	},
	{
		matches: (hextets) => hextets[0] === 100 && hextets[1] === 65435 && hextets[2] === 1 && hextets[3] === 0 && hextets[4] === 0 && hextets[5] === 0,
		extract: (hextets) => [hextets[6], hextets[7]]
	},
	{
		matches: (hextets) => hextets[0] === 8194,
		extract: (hextets) => [hextets[1], hextets[2]]
	},
	{
		matches: (hextets) => hextets[0] === 8193 && hextets[1] === 0,
		extract: (hextets) => [hextets[6] ^ 65535, hextets[7] ^ 65535]
	},
	{
		matches: (hextets) => (hextets[4] & 64767) === 0 && hextets[5] === 24318,
		extract: (hextets) => [hextets[6], hextets[7]]
	}
];
function extractIpv4FromEmbeddedIpv6(hextets) {
	for (const rule of EMBEDDED_IPV4_RULES) {
		if (!rule.matches(hextets)) continue;
		const [high, low] = rule.extract(hextets);
		return decodeIpv4FromHextets(high, low);
	}
	return null;
}
function isPrivateIpv4(parts) {
	const [octet1, octet2] = parts;
	if (octet1 === 0) return true;
	if (octet1 === 10) return true;
	if (octet1 === 127) return true;
	if (octet1 === 169 && octet2 === 254) return true;
	if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return true;
	if (octet1 === 192 && octet2 === 168) return true;
	if (octet1 === 100 && octet2 >= 64 && octet2 <= 127) return true;
	return false;
}
function isPrivateIpAddress(address) {
	let normalized = address.trim().toLowerCase();
	if (normalized.startsWith("[") && normalized.endsWith("]")) normalized = normalized.slice(1, -1);
	if (!normalized) return false;
	if (normalized.includes(":")) {
		const hextets = parseIpv6Hextets(normalized);
		if (!hextets) return true;
		const isUnspecified = hextets[0] === 0 && hextets[1] === 0 && hextets[2] === 0 && hextets[3] === 0 && hextets[4] === 0 && hextets[5] === 0 && hextets[6] === 0 && hextets[7] === 0;
		const isLoopback = hextets[0] === 0 && hextets[1] === 0 && hextets[2] === 0 && hextets[3] === 0 && hextets[4] === 0 && hextets[5] === 0 && hextets[6] === 0 && hextets[7] === 1;
		if (isUnspecified || isLoopback) return true;
		const embeddedIpv4 = extractIpv4FromEmbeddedIpv6(hextets);
		if (embeddedIpv4) return isPrivateIpv4(embeddedIpv4);
		const first = hextets[0];
		if ((first & 65472) === 65152) return true;
		if ((first & 65472) === 65216) return true;
		if ((first & 65024) === 64512) return true;
		return false;
	}
	const ipv4 = parseIpv4(normalized);
	if (ipv4) return isPrivateIpv4(ipv4);
	if (isUnsupportedLegacyIpv4Literal(normalized)) return true;
	return false;
}
function isBlockedHostnameNormalized(normalized) {
	if (BLOCKED_HOSTNAMES.has(normalized)) return true;
	return normalized.endsWith(".localhost") || normalized.endsWith(".local") || normalized.endsWith(".internal");
}
function isBlockedHostnameOrIp(hostname) {
	const normalized = normalizeHostname(hostname);
	if (!normalized) return false;
	return isBlockedHostnameNormalized(normalized) || isPrivateIpAddress(normalized);
}
function createPinnedLookup(params) {
	const normalizedHost = normalizeHostname(params.hostname);
	const fallback = params.fallback ?? lookup;
	const fallbackLookup = fallback;
	const fallbackWithOptions = fallback;
	const records = params.addresses.map((address) => ({
		address,
		family: address.includes(":") ? 6 : 4
	}));
	let index = 0;
	return ((host, options, callback) => {
		const cb = typeof options === "function" ? options : callback;
		if (!cb) return;
		const normalized = normalizeHostname(host);
		if (!normalized || normalized !== normalizedHost) {
			if (typeof options === "function" || options === void 0) return fallbackLookup(host, cb);
			return fallbackWithOptions(host, options, cb);
		}
		const opts = typeof options === "object" && options !== null ? options : {};
		const requestedFamily = typeof options === "number" ? options : typeof opts.family === "number" ? opts.family : 0;
		const candidates = requestedFamily === 4 || requestedFamily === 6 ? records.filter((entry) => entry.family === requestedFamily) : records;
		const usable = candidates.length > 0 ? candidates : records;
		if (opts.all) {
			cb(null, usable);
			return;
		}
		const chosen = usable[index % usable.length];
		index += 1;
		cb(null, chosen.address, chosen.family);
	});
}
async function resolvePinnedHostnameWithPolicy(hostname, params = {}) {
	const normalized = normalizeHostname(hostname);
	if (!normalized) throw new Error("Invalid hostname");
	const allowPrivateNetwork = Boolean(params.policy?.allowPrivateNetwork);
	const allowedHostnames = normalizeHostnameSet(params.policy?.allowedHostnames);
	const hostnameAllowlist = normalizeHostnameAllowlist(params.policy?.hostnameAllowlist);
	const isExplicitAllowed = allowedHostnames.has(normalized);
	if (!matchesHostnameAllowlist(normalized, hostnameAllowlist)) throw new SsrFBlockedError(`Blocked hostname (not in allowlist): ${hostname}`);
	if (!allowPrivateNetwork && !isExplicitAllowed && isBlockedHostnameOrIp(normalized)) throw new SsrFBlockedError("Blocked hostname or private/internal IP address");
	const results = await (params.lookupFn ?? lookup$1)(normalized, { all: true });
	if (results.length === 0) throw new Error(`Unable to resolve hostname: ${hostname}`);
	if (!allowPrivateNetwork && !isExplicitAllowed) {
		for (const entry of results) if (isPrivateIpAddress(entry.address)) throw new SsrFBlockedError("Blocked: resolves to private/internal IP address");
	}
	const addresses = Array.from(new Set(results.map((entry) => entry.address)));
	if (addresses.length === 0) throw new Error(`Unable to resolve hostname: ${hostname}`);
	return {
		hostname: normalized,
		addresses,
		lookup: createPinnedLookup({
			hostname: normalized,
			addresses
		})
	};
}
function createPinnedDispatcher(pinned) {
	return new Agent({ connect: { lookup: pinned.lookup } });
}
async function closeDispatcher(dispatcher) {
	if (!dispatcher) return;
	const candidate = dispatcher;
	try {
		if (typeof candidate.close === "function") {
			await candidate.close();
			return;
		}
		if (typeof candidate.destroy === "function") candidate.destroy();
	} catch {}
}

//#endregion
export { resolvePinnedHostnameWithPolicy as a, isBlockedHostnameOrIp as i, closeDispatcher as n, normalizeHostname as o, createPinnedDispatcher as r, SsrFBlockedError as t };