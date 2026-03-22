import { MidiMessage } from "../midi-driver/mod.ts";
export { type MidiMessage };

const FORCE_DEV = true;

export type WebsocketServerMessage =
  | {
    type: "connection-information";
    connectionId: string;
    overlayPath: string;
  }
  | { type: "midi-data"; data: MidiMessage }
  | { type: "close" }

export function createWebsocketConnectionInfoPayload(connectionId: string): any {
  return {
    type: "connection-information",
    connectionId,
    overlayPath: FORCE_DEV ? "http://localhost:8000/overlays" : "/overlays",
  };
}

export function createMidiEventPayload(
  data: MidiMessage,
): WebsocketServerMessage {
  return {
    type: "midi-data",
    data,
  };
}
