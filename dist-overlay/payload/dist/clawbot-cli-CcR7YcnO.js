import { p as theme } from "./globals-Bv4ZcVWM.js";
import "./paths-BfR2LXbA.js";
import "./subsystem-Cf9yS0UI.js";
import "./boolean-DTgd5CzD.js";
import "./auth-profiles-D6r73dBV.js";
import "./agent-scope-Da1EU5GK.js";
import "./utils-C5WN6czr.js";
import "./openclaw-root-CUd_d2ed.js";
import "./logger-DUUyiuLB.js";
import "./exec-ByKs6PmP.js";
import "./github-copilot-token-CcBrBN3h.js";
import "./host-env-security-blJbxyQo.js";
import "./version-Bxx5bg6l.js";
import "./registry-DoLLbW4m.js";
import "./manifest-registry-CuX_zqg5.js";
import "./message-channel-Be-gqLbb.js";
import "./tailnet-Cw5P8QcH.js";
import "./ws-D5Iy1RWM.js";
import "./credentials-C1NEYRqY.js";
import "./resolve-configured-secret-input-string-B5ySloY0.js";
import "./call-B6w9tujD.js";
import "./pairing-token-DSWSMr10.js";
import "./runtime-config-collectors-Ca3G0HGE.js";
import "./command-secret-targets-CiBVZbcI.js";
import { t as formatDocsLink } from "./links-BvlkOkWs.js";
import { n as registerQrCli } from "./qr-cli-B32obU7F.js";
//#region src/cli/clawbot-cli.ts
function registerClawbotCli(program) {
	registerQrCli(program.command("clawbot").description("Legacy clawbot command aliases").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/clawbot", "docs.openclaw.ai/cli/clawbot")}\n`));
}
//#endregion
export { registerClawbotCli };
