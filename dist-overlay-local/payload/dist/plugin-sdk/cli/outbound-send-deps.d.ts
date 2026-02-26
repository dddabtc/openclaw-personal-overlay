import type { OutboundSendDeps } from "../infra/outbound/deliver.js";
export type CliDeps = {
    sendMessageWhatsApp: NonNullable<OutboundSendDeps["sendWhatsApp"]>;
    sendMessageTelegram: NonNullable<OutboundSendDeps["sendTelegram"]>;
    sendMessageDiscord: NonNullable<OutboundSendDeps["sendDiscord"]>;
    sendMessageSlack: NonNullable<OutboundSendDeps["sendSlack"]>;
    sendMessageSignal: NonNullable<OutboundSendDeps["sendSignal"]>;
    sendMessageIMessage: NonNullable<OutboundSendDeps["sendIMessage"]>;
};
export declare function createOutboundSendDeps(deps: CliDeps): OutboundSendDeps;
