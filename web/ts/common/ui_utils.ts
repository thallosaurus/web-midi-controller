import { Overlay } from "../../bindings/Overlay";
import { change_overlay, clear_loaded_overlays, load_overlays_from_array, LoadedOverlay, setup_tabs } from "../ui/overlay";
import { SocketWorkerResponse, SocketWorkerResponseType } from "../websocket/message";
import { disconnectSocketMessage } from "../websocket/client";
//import { close_dialog } from "../ui/dialogs";

export function vibrate() {
  if (navigator.vibrate) {
    navigator.vibrate(20);
  }
}

export function init_mapping_trigger() {
  let trig = document.querySelectorAll<HTMLElement>("[data-map-mode-trigger]");
  let o = document.querySelector<HTMLDivElement>("#overlays");

  for (const t of trig) {
    t.addEventListener("click", (e) => {
      o?.classList.toggle("mapmode");
    })
  }
}

export function setup_overlay_selector(ol: LoadedOverlay[]) {
  // setup overlay chooser
  const overlay_selector = document.querySelector<HTMLDivElement>(
    "#overlay_selector",
  )!;
  setup_tabs(ol, overlay_selector, (i) => {
    console.log("setting tab ", i)
    change_overlay(i);
    //close_dialog("menu")
  });
  //change_overlay(0);*/
}

/**
 * setup the given WebSocket Worker for the Application
 * @deprecated
 * @param worker 
 */
/*export function initWebsocketUI(worker: Worker) {
  const app_elem = document.querySelector<HTMLDivElement>("#app")!;
  app_elem.classList.add("disconnected");
  
  const fn = (ev: MessageEvent<any>) => {
    const msg: SocketWorkerResponseType = JSON.parse(ev.data);
    switch (msg.type) {
      case SocketWorkerResponse.Disconnected:
        app_elem.classList.add("disconnected");
        clear_loaded_overlays();
        clear_overlay_selector();
        // maybe?
        worker.removeEventListener("message", fn);
        break;

        // TODO Connect case for reconnects?
    }
  }
  worker.addEventListener("message", fn);
}*/

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
        //disconnectSocketMessage();
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

/**
 * @deprecated
 */
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

