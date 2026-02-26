import "./auth-profiles-C7RTY9Sv.js";
import "./exec-CBKBIMpA.js";
import "./agent-scope-DhajVyRS.js";
import "./github-copilot-token-DuFIqfeC.js";
import "./manifest-registry-XSxPcu0S.js";
import "./config-BBNa7O_8.js";
import { n as registerQrCli } from "./qr-cli-CxAxLY-5.js";

//#region src/cli/clawbot-cli.ts
function registerClawbotCli(program) {
	registerQrCli(program.command("clawbot").description("Legacy clawbot command aliases"));
}

//#endregion
export { registerClawbotCli };