import "./paths-BJV7vkaX.js";
import { p as theme } from "./globals-BM8hKFm0.js";
import "./utils-DC4zYvW0.js";
import "./agent-scope-Cbp0nOOm.js";
import "./subsystem-C9Xgeyrw.js";
import "./openclaw-root-D1FcrxOp.js";
import "./logger-BKkZU9TX.js";
import "./exec-nuW3NMJe.js";
import "./model-selection-Dnp6qsMS.js";
import "./github-copilot-token-BQoM_VEX.js";
import "./boolean-D8Ha5nYV.js";
import "./env-ByppU_6u.js";
import "./host-env-security-CbFV1gAw.js";
import "./registry-DGVIIthr.js";
import "./manifest-registry-BMEqbkWA.js";
import "./message-channel-DMsTX_8C.js";
import "./tailnet-aR1njljD.js";
import "./ws-CyLniShb.js";
import "./credentials-BXh0SH4r.js";
import "./resolve-configured-secret-input-string-nrn5ht8y.js";
import "./call-CUrd3PC6.js";
import "./pairing-token-CVcXi_hV.js";
import "./runtime-config-collectors-DOXref8L.js";
import "./command-secret-targets-CNFs2Wd9.js";
import { t as formatDocsLink } from "./links-CoNMV1eb.js";
import { n as registerQrCli } from "./qr-cli-Cnq9zD-m.js";
//#region src/cli/clawbot-cli.ts
function registerClawbotCli(program) {
	registerQrCli(program.command("clawbot").description("Legacy clawbot command aliases").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/clawbot", "docs.openclaw.ai/cli/clawbot")}\n`));
}
//#endregion
export { registerClawbotCli };
