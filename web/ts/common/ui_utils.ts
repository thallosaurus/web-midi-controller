import { Overlay } from "../../bindings/Overlay";
import { change_overlay, clear_loaded_overlays, load_overlays_from_array, LoadedOverlay, setup_tabs } from "../ui/overlay";
import { WorkerMessage, WorkerMessageType } from "../websocket/message";
import { DisconnectSocketEvent, FrontendSocketEvent } from "../websocket/client";
import { close_dialog } from "./../ui/dialogs";
//import { init_with_worker } from "./utils";
import { sendUpdateCCValue, sendUpdateNoteValue } from "../event_bus/client";
import { CCEvent, NoteEvent } from "./events";

export function setup_overlay_selector(ol: LoadedOverlay[]) {
  // setup overlay chooser
  console.log(document);
  const overlay_selector = document.querySelector<HTMLDivElement>(
    "#overlay_selector",
  )!;
  setup_tabs(ol, overlay_selector, (i) => {
    console.log("setting tab ", i)
    change_overlay(i);
    close_dialog("menu")
  });
  //change_overlay(0);*/
}

/**
 * setup the given WebSocket Worker for the Application
 * @param worker 
 */
export function initWebsocketUI(worker: Worker) {
  const app_elem = document.querySelector<HTMLDivElement>("#app")!;
  app_elem.classList.add("disconnected");
  
  const fn = (ev: MessageEvent<any>) => {
    const msg: WorkerMessage = JSON.parse(ev.data);
    switch (msg.type) {
      case WorkerMessageType.Disconnected:
        app_elem.classList.add("disconnected");
        clear_loaded_overlays();
        clear_overlay_selector();
        // maybe?
        worker.removeEventListener("message", fn);
        break;

        // TODO Connect case for reconnects?

/*      case WorkerMessageType.MidiFrontendInput:
        console.log("sending event from websocket", msg)
        FrontendSocketEvent(msg.data);

        if (msg.data.type == "ccupdate") {
          const cc_ev = msg.data as CCEvent;
          sendUpdateCCValue(cc_ev.midi_channel, cc_ev.cc, cc_ev.value);
          return
        } else if (msg.data.event_name == "noteupdate") {
          const note_ev = msg.data as NoteEvent;
          sendUpdateNoteValue(note_ev.midi_channel, note_ev.note, note_ev.velocity, note_ev.on)
          return;
        }
        break;*/
    }
  }
  worker.addEventListener("message", fn);
}

/**
 * @deprecated
 * @returns 
export function initWebsocketWorkerWithOverlaySelection() {
  console.log("start initWebsocketWorkerWithOverlaySelection")
  const app_elem = document.querySelector<HTMLDivElement>("#app")!;
  console.log(app_elem);
  app_elem.classList.add("disconnected");
  return init_with_worker().then(([worker, connectionInfo]) => {
    console.log(connectionInfo);
    worker.addEventListener("message", (e) => {
      const msg: WorkerMessage = JSON.parse(e.data);
      switch (msg.type) {
        case WorkerMessageType.Disconnected:
          app_elem.classList.add("disconnected");
          clear_loaded_overlays();
          clear_overlay_selector();
          break;
        }
      });
      app_elem.classList.remove("disconnected");
      return fetchOverlaysAndRegister(connectionInfo.overlay_path)
    })
    .then(loadedOverlays => {
      
    setup_overlay_selector(loadedOverlays);
    change_overlay(0);
    //console.log(e);
  })
}
*/


// UI Shit
export function init_debug() {
  if (import.meta.env.DEV) {
    console.log("running in development server");

    console.log("activating development listeners");
    window.addEventListener("error", e => {
      //alert("error:" + e.message + e.filename + e.lineno);
      console.error("error:" + e.message + e.filename + e.lineno);
    });
    window.addEventListener("unhandledrejection", e => {
      //alert("promise error:" + e.reason);
      console.error("promise error:" + e.reason);
    });

    // add debug connection toggles
    document.querySelectorAll<HTMLDivElement>(".menu-connected-label").forEach(menu_connected_label => {
      menu_connected_label.addEventListener("click", (e) => {
        DisconnectSocketEvent();
      })
    });

    document.querySelectorAll<HTMLDivElement>(".menu-disconnected-label").forEach(menu_disconnected_label => {

      menu_disconnected_label.addEventListener("click", (e) => {
        //ConnectSocketEvent();
        //debugger
        /*init_with_worker().then(e => {
          })*/
        /*initWebsocketWorkerWithOverlaySelection().then(() => {
          console.log("debug reconnect successful", e);
        });*/
      })
    });
  }
}


const clear_overlay_selector = () => {
  const overlay_selector = document.querySelector<HTMLUListElement>(
    "ul#overlay_selector",
  )!;

  const childs = overlay_selector.querySelectorAll<HTMLLIElement>("[data-role='overlay_switch']");

  console.log(overlay_selector);

  childs.forEach(e => {
    overlay_selector.removeChild(e);
  })
}

/**
 * @deprecated
 * @param uri 
 * @returns 
 */
async function fetchOverlaysAndRegister(uri: string) {
  const o = await fetch(uri);
  const ol: Array<Overlay> = await o.json();
  return await load_overlays_from_array(ol);
}

