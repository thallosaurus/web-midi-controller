import { CoreWorkerMessage } from "../coreworker/worker";
//import { MidiMessage } from "../../../midi-driver/bindings/MidiPayload";
import type { MidiMessage } from "midi-driver/bindings/MidiPayload";

export type WebsocketWorkerEvent =
    | CoreWorkerMessage
    | { type: "connect", host: string, port: number, path: string }
    | { type: "connection-successful", overlayPath: string }
    | { type: "connection-failed", error: string }
    | { type: "disconnect" }
    | { type: "disconnect-successful" }
    | { type: "disconnect-failed", error: string }
    | { type: "data", payload: MidiMessage }