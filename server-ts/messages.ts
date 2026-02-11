import { MidiMessage } from "@driver";
export { type MidiMessage };

export type WebsocketServerMessage = 
| { type: "connection-information", connectionId: string, overlayPath: string } 
| { type: "midi-data", data: MidiMessage }

export function createWebsocketConnectionInfoPayload(): any {
    return {
        type: "connection-information",
        connectionId: crypto.randomUUID(),
        overlayPath: "http://localhost:8000/overlays"
    }
}

export function createMidiEventPayload(data: MidiMessage): WebsocketServerMessage {
    return {
        type: "midi-data",
        data
    }
}