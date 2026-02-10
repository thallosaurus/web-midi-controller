import { MidiMessage } from "@driver";
export { type MidiMessage };

export type WebsocketServerMessage = 
| { type: "connection-information", connectionId: string, overlayPath: string } 
| { type: "midi-event", data: MidiMessage }

export function createWebsocketConnectionInfoPayload(): any {
    return {
        type: "connection-information",
        connectionId: crypto.randomUUID(),
        overlayPath: "/overlays"
    }
}

export function createMidiEventPayload(data: MidiMessage): WebsocketServerMessage {
    return {
        type: "midi-event",
        data
    }
}