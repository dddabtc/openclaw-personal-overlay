import { p as theme } from "./globals-Bv4ZcVWM.js";
import "./paths-BfR2LXbA.js";
import "./subsystem-Cf9yS0UI.js";
import "./boolean-DTgd5CzD.js";
import "./auth-profiles-5CHn7vq1.js";
import "./agent-scope-DF-nzI8H.js";
import "./utils-C5WN6czr.js";
import "./openclaw-root-DFJGXT24.js";
import "./logger-DUUyiuLB.js";
import "./exec-ByKs6PmP.js";
import "./github-copilot-token-CcBrBN3h.js";
import "./host-env-security-blJbxyQo.js";
import "./version-Bxx5bg6l.js";
import "./registry-DoLLbW4m.js";
import "./manifest-registry-Ba187z7Z.js";
import "./message-channel-Be-gqLbb.js";
import "./tailnet-BuB4hnEo.js";
import "./ws-Bjkel2eG.js";
import "./credentials-C5dZtBqt.js";
import "./resolve-configured-secret-input-string-BGiZkpTb.js";
import "./call-jim2IS_j.js";
import "./pairing-token-DSWSMr10.js";
import "./runtime-config-collectors-DpnTnwYq.js";
import "./command-secret-targets-BPdIQBpp.js";
import { t as formatDocsLink } from "./links-BvlkOkWs.js";
import { n as registerQrCli } from "./qr-cli-O9LzzWYz.js";
//#region src/cli/clawbot-cli.ts
function registerClawbotCli(program) {
	registerQrCli(program.command("clawbot").description("Legacy clawbot command aliases").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/clawbot", "docs.openclaw.ai/cli/clawbot")}\n`));
}
//#endregion
export { registerClawbotCli };
