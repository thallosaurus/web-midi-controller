import type { Overlay } from "../bindings/Overlay";
import { process_external } from "./event_bus";
import { close_dialog } from "./ui/dialogs";
import { change_overlay, clear_loaded_overlays, load_overlays_from_array, LoadedOverlay, setup_tabs } from "./ui/overlay";
import { wsWorker, DisconnectSocketEvent, ConnectSocketEvent, initWebsocketWorker } from "./websocket/worker_client";
import { WorkerMessageType, type ConnectedMessage, type WorkerMessage } from "./websocket/message";

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

export function init_debug() {
  if (import.meta.env.DEV) {
    console.log("running in development server");

    console.log("activating development listeners");
    window.addEventListener("error", e => {
      alert("error:" + e.message + e.filename + e.lineno);
    });
    window.addEventListener("unhandledrejection", e => {
      alert("promise error:" + e.reason);
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
        initWebsocketWorkerWithOverlaySelection().then(() => {
          console.log("debug reconnect successful", e);
        });
      })
    });
  }
}

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

async function fetchOverlaysAndRegister(uri: string) {
  const o = await fetch(uri);
  const ol: Array<Overlay> = await o.json();
  return await load_overlays_from_array(ol);
}

function setup_overlay_selector(ol: LoadedOverlay[]) {
  // setup overlay chooser
  console.log(document);
  const overlay_selector = document.querySelector<HTMLDivElement>(
    "#overlay_selector",
  )!;
  setup_tabs(ol, overlay_selector, (i) => {
    console.log("setting tab ", i)
    change_overlay(i);
    close_dialog("overlay_menu")
  });
  //change_overlay(0);*/
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
        process_external(msg.data);
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