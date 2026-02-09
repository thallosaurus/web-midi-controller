export type WebsocketEventPayload = WebsocketConnectionInfoPayload | WebsocketMidiEventPayload;

import { MidiMessage } from "@driver";

export enum WebsocketEvent {
  ConnectionInformation = "connection-information",
  MidiEvent = "midi-event"
}

interface WebsocketConnectionInfoPayload {
    type: WebsocketEvent.ConnectionInformation,
    connectionId: string,
    overlayPath: string
}

export interface WebsocketMidiEventPayload {
    type: WebsocketEvent.MidiEvent,
    data: MidiMessage
}

export function createWebsocketConnectionInfoPayload(): WebsocketConnectionInfoPayload {
    return {
        type: WebsocketEvent.ConnectionInformation,
        connectionId: crypto.randomUUID(),
        overlayPath: "/overlays"
    }
}

export function createMidiEventPayload(data: MidiMessage): WebsocketMidiEventPayload {
    return {
        type: WebsocketEvent.MidiEvent,
        data
    }
}