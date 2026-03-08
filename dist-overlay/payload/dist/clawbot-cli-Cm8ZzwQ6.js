import { p as theme } from "./globals-Bv4ZcVWM.js";
import "./paths-BfR2LXbA.js";
import "./subsystem-Cf9yS0UI.js";
import "./boolean-DTgd5CzD.js";
import "./auth-profiles-B1GaQT5q.js";
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
import "./tailnet-D6G15e7J.js";
import "./ws-Z0GdyNOg.js";
import "./credentials-BmtdMaC0.js";
import "./resolve-configured-secret-input-string-Cjny1Pmf.js";
import "./call-qPAXM4nu.js";
import "./pairing-token-DSWSMr10.js";
import "./runtime-config-collectors-DHveN9Fx.js";
import "./command-secret-targets-GGw5yqsw.js";
import { t as formatDocsLink } from "./links-BvlkOkWs.js";
import { n as registerQrCli } from "./qr-cli-CjohmETz.js";
//#region src/cli/clawbot-cli.ts
function registerClawbotCli(program) {
	registerQrCli(program.command("clawbot").description("Legacy clawbot command aliases").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/clawbot", "docs.openclaw.ai/cli/clawbot")}\n`));
}
//#endregion
export { registerClawbotCli };
