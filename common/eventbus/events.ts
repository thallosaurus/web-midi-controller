import { type MidiMessage } from "../../../midi-driver/bindings/MidiPayload";
import { CoreWorkerMessage } from "../coreworker/worker";
//import { MidiMessage } from "server-ts/messages";

export type EventBusWorkerEvent =
    | CoreWorkerMessage
    | EventBusWorkerConsumerEvent
    | EventBusWorkerProducerEvent

export type EventBusWorkerConsumerEvent =
    // consumer
    | { type: "init" }
    | { type: "update-cc-value", cc: number, channel: number, value: number, external: boolean }
    | { type: "update-note-value", note: number, channel: number, value: number, external: boolean }
    //| { type: "update-jog-value", cc: number, channel: number, value: number }
    | { type: "register-cc-widget", id: string, channel: number, cc: number, init?: number }
    | { type: "register-note-widget", id: string, channel: number, note: number, init?: number }
    | { type: "unregister-cc-widget", id: string, channel: number, cc: number }
    | { type: "unregister-note-widget", id: string, channel: number, note: number }

export type EventBusWorkerProducerEvent =
    | { type: "init-callback" }
    | { type: "cc-update", consumerId: string, channel: number, cc: number, value: number }
    | { type: "note-update", consumerId: string, channel: number, note: number, velocity: number, on: boolean }
    | { type: "register-cc-callback", consumerId: string }
    | { type: "register-note-callback", consumerId: string }
    | { type: "unregister-cc-callback", oldId: string }
    | { type: "unregister-note-callback", oldId: string }
    | { type: "midi-data", data: MidiMessage }
