import { p as theme } from "./globals-Bv4ZcVWM.js";
import "./paths-BfR2LXbA.js";
import "./subsystem-Cf9yS0UI.js";
import "./boolean-DTgd5CzD.js";
import "./auth-profiles-Dfz0edQp.js";
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
import "./tailnet-2S_sxwVw.js";
import "./ws-D9tlW60e.js";
import "./credentials-D-VDFBx4.js";
import "./resolve-configured-secret-input-string-63W718rD.js";
import "./call-DAIDQCnk.js";
import "./pairing-token-DSWSMr10.js";
import "./runtime-config-collectors-CPvXRwE6.js";
import "./command-secret-targets-CdR558gG.js";
import { t as formatDocsLink } from "./links-BvlkOkWs.js";
import { n as registerQrCli } from "./qr-cli-BI-BmFpg.js";
//#region src/cli/clawbot-cli.ts
function registerClawbotCli(program) {
	registerQrCli(program.command("clawbot").description("Legacy clawbot command aliases").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/clawbot", "docs.openclaw.ai/cli/clawbot")}\n`));
}
//#endregion
export { registerClawbotCli };
