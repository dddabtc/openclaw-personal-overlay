import "./paths-B4BZAPZh.js";
import "./utils-CP9YLh6M.js";
import "./registry-B-j4DRfe.js";
import "./subsystem-BCQGGxdd.js";
import "./exec-DYqRzFbo.js";
import "./agent-scope-B36jktKj.js";
import "./model-selection-mHHEzs4Y.js";
import "./github-copilot-token-D2zp6kMZ.js";
import "./boolean-BsqeuxE6.js";
import "./env-VriqyjXT.js";
import "./config-HiRdak1Z.js";
import "./manifest-registry-D2lPzXIl.js";
import { n as registerQrCli } from "./qr-cli-OouLkwME.js";

//#region src/cli/clawbot-cli.ts
function registerClawbotCli(program) {
	registerQrCli(program.command("clawbot").description("Legacy clawbot command aliases"));
}

//#endregion
export { registerClawbotCli };