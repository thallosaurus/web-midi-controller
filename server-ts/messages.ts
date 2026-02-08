export type WebsocketEventPayload = WebsocketConnectionInfoPayload | WebsocketMidiEventPayload;

export enum WebsocketEvent {
  ConnectionInformation = "connection-information",
  MidiEvent = "midi-event"
}

interface WebsocketConnectionInfoPayload {
    type: WebsocketEvent.ConnectionInformation,
    connectionId: string,
    overlayPath: string
}

interface WebsocketMidiEventPayload {
    type: WebsocketEvent.MidiEvent,
    data: any
}

export function createWebsocketConnectionInfoPayload(): WebsocketConnectionInfoPayload {
    return {
        type: WebsocketEvent.ConnectionInformation,
        connectionId: crypto.randomUUID(),
        overlayPath: "/overlays"
    }
}

export function createMidiEventPayload(data: string): WebsocketMidiEventPayload {
    return {
        type: WebsocketEvent.MidiEvent,
        data
    }
}