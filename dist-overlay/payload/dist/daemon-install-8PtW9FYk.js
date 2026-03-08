import "./paths-BJV7vkaX.js";
import "./globals-BM8hKFm0.js";
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
import "./dock-BvmTvlyF.js";
import "./message-channel-DMsTX_8C.js";
import "./plugins-t3ljVB7c.js";
import "./sessions-Cqv9FKMF.js";
import "./tailscale-DrDx-3cv.js";
import "./tailnet-DQFT4WRD.js";
import "./ws-DCAgtqK4.js";
import "./auth-CkQjEn8_.js";
import "./credentials-DFpHgFp_.js";
import "./accounts-WRgl0tJ1.js";
import "./channel-config-helpers-BnsIklFT.js";
import "./accounts-BtlgULZC.js";
import "./paths-BWOXmNIW.js";
import "./chat-envelope-BkySjpPY.js";
import "./call-CbaJN9rS.js";
import "./pairing-token-CVcXi_hV.js";
import "./onboard-helpers-DPeYGnt1.js";
import "./prompt-style-D8LvsnSX.js";
import "./runtime-guard-C_HR58Q-.js";
import "./note-OzIdLwt-.js";
import "./daemon-install-plan.shared-6BfiTrDp.js";
import { n as buildGatewayInstallPlan, r as gatewayInstallErrorHint, t as resolveGatewayInstallToken } from "./gateway-install-token-BojBhxL0.js";
import { r as isGatewayDaemonRuntime } from "./daemon-runtime-Bx94r1xS.js";
import { i as isSystemdUserServiceAvailable } from "./systemd-CDE2L1RN.js";
import { t as resolveGatewayService } from "./service-DKIwLdlY.js";
import { n as ensureSystemdUserLingerNonInteractive } from "./systemd-linger-B613qchN.js";
//#region src/commands/onboard-non-interactive/local/daemon-install.ts
async function installGatewayDaemonNonInteractive(params) {
	const { opts, runtime, port } = params;
	if (!opts.installDaemon) return;
	const daemonRuntimeRaw = opts.daemonRuntime ?? "node";
	const systemdAvailable = process.platform === "linux" ? await isSystemdUserServiceAvailable() : true;
	if (process.platform === "linux" && !systemdAvailable) {
		runtime.log("Systemd user services are unavailable; skipping service install.");
		return;
	}
	if (!isGatewayDaemonRuntime(daemonRuntimeRaw)) {
		runtime.error("Invalid --daemon-runtime (use node or bun)");
		runtime.exit(1);
		return;
	}
	const service = resolveGatewayService();
	const tokenResolution = await resolveGatewayInstallToken({
		config: params.nextConfig,
		env: process.env
	});
	for (const warning of tokenResolution.warnings) runtime.log(warning);
	if (tokenResolution.unavailableReason) {
		runtime.error([
			"Gateway install blocked:",
			tokenResolution.unavailableReason,
			"Fix gateway auth config/token input and rerun onboarding."
		].join(" "));
		runtime.exit(1);
		return;
	}
	const { programArguments, workingDirectory, environment } = await buildGatewayInstallPlan({
		env: process.env,
		port,
		runtime: daemonRuntimeRaw,
		warn: (message) => runtime.log(message),
		config: params.nextConfig
	});
	try {
		await service.install({
			env: process.env,
			stdout: process.stdout,
			programArguments,
			workingDirectory,
			environment
		});
	} catch (err) {
		runtime.error(`Gateway service install failed: ${String(err)}`);
		runtime.log(gatewayInstallErrorHint());
		return;
	}
	await ensureSystemdUserLingerNonInteractive({ runtime });
}
//#endregion
export { installGatewayDaemonNonInteractive };
