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

/**
 * Function that loads the state and socket management in the background
 * @deprecated
 * @returns 
 */
export const init_with_worker = async (): Promise<[Worker, ConnectedMessage]> => {
  // setup connection 

  const [worker, conn_msg] = await initWebsocketWorker();

  worker.addEventListener("message", ev => {
    const msg: WorkerMessage = JSON.parse(ev.data);
    //console.log("worker message in main thread", msg);
    switch (msg.type) {
      case WorkerMessageType.MidiFrontendInput:
        // process data here that was sent through the websocket
        //process_external_compat(msg.data);
        console.log("sending event from websocket", msg)
        FrontendSocketEvent(msg.data);

        /*if (msg.data.type == "ccupdate") {
          const cc_ev = msg.data as CCEvent;
          sendUpdateCCValue(cc_ev.midi_channel, cc_ev.cc, cc_ev.value);
          return
        } else if (msg.data.event_name == "noteupdate") {
          const note_ev = msg.data as NoteEvent;
          sendUpdateNoteValue(note_ev.midi_channel, note_ev.note, note_ev.velocity, note_ev.on)
          return;
        }*/

        //sendFrontendMidiEvent(, msg.data);
        // send to event bus
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
