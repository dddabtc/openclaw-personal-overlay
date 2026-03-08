import "./paths-BJV7vkaX.js";
import { p as theme } from "./globals-BM8hKFm0.js";
import "./utils-DC4zYvW0.js";
import "./agent-scope-Cbp0nOOm.js";
import "./subsystem-C9Xgeyrw.js";
import "./openclaw-root-D1FcrxOp.js";
import "./logger-BKkZU9TX.js";
import "./exec-nuW3NMJe.js";
import "./model-selection-L7RMwsG-.js";
import "./github-copilot-token-BQoM_VEX.js";
import "./boolean-D8Ha5nYV.js";
import "./env-ByppU_6u.js";
import "./host-env-security-CbFV1gAw.js";
import "./registry-DGVIIthr.js";
import "./manifest-registry-BMEqbkWA.js";
import "./message-channel-DMsTX_8C.js";
import "./tailnet-DQFT4WRD.js";
import "./ws-DCAgtqK4.js";
import "./credentials-DFpHgFp_.js";
import "./resolve-configured-secret-input-string-DNyQwn7C.js";
import "./call-CbaJN9rS.js";
import "./pairing-token-CVcXi_hV.js";
import "./runtime-config-collectors-B4hxb0i8.js";
import "./command-secret-targets-DsXaKLn0.js";
import { t as formatDocsLink } from "./links-CoNMV1eb.js";
import { n as registerQrCli } from "./qr-cli-DGOLIXzU.js";
//#region src/cli/clawbot-cli.ts
function registerClawbotCli(program) {
	registerQrCli(program.command("clawbot").description("Legacy clawbot command aliases").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/clawbot", "docs.openclaw.ai/cli/clawbot")}\n`));
}
//#endregion
export { registerClawbotCli };
