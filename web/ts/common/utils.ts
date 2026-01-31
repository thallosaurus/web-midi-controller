import type { Overlay } from "../../bindings/Overlay";
//import { process_external } from "./../event_bus";

import { initWebsocketWorker } from "../websocket/client.ts";
import { WorkerMessageType, type ConnectedMessage, type WorkerMessage } from "../websocket/message";
import { process_external_compat } from "../event_bus.ts";

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

/**
 * Function that loads the state and socket management in the background
 * @returns 
 */
export const init_with_worker = async (): Promise<[Worker, ConnectedMessage]> => {
  // setup connection 

  const [worker, conn_msg] = await initWebsocketWorker();

  worker.addEventListener("message", ev => {
    const msg: WorkerMessage = JSON.parse(ev.data);
    console.log("worker message in main thread", msg);
    switch (msg.type) {
      case WorkerMessageType.MidiFrontendInput:
        // process data here that was sent through the websocket
        process_external_compat(msg.data);
        break;
      /*case WorkerMessageType.Disconnected:
        app_elem.classList.add("disconnected");
        clear_loaded_overlays();
        clear_overlay_selector();
        break;*/
    }
  });

  return [worker, conn_msg];
  //let status = document.querySelector<HTMLDivElement>("#connection_status")!;
}
