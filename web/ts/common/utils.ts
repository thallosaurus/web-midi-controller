import type { Overlay } from "../../bindings/Overlay";
import { sendUpdateCCValue, sendUpdateNoteValue } from "../event_bus/client.ts";
import { type CCEvent, NoteEvent } from "./events.ts";
//import { process_external } from "./../event_bus";

import { FrontendSocketEvent, initWebsocketWorker } from "../websocket/client.ts";
import { WorkerMessageType, type ConnectedMessage, type WorkerMessage } from "../websocket/message";
//import { process_external_compat } from "../event_bus.ts/index.ts";

export function vibrate() {
  if (navigator.vibrate) {
    navigator.vibrate(20);
  }
}

export function uuid(): string {
  if (crypto && crypto.randomUUID) {
    return crypto.randomUUID()
  } else {
    return pseudoUUID();
  }
}

function pseudoUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}