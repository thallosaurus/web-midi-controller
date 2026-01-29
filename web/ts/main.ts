import type { Overlay } from "../bindings/Overlay.ts";
import { init_event_bus, process_external } from "./event_bus.ts";
import "./style.css";
import "./ui/css/colors.css";
//import { setup_ccbutton, setup_notebutton } from "./ui/button.ts";
import { change_overlay, load_overlays_from_array, LoadedOverlay, overlayUri, setup_tabs } from "./ui/overlay.ts";

import { close_dialog, init_dialogs } from './ui/dialogs.ts'
import { init_debug } from "./utils.ts";


import { initWebsocketWorker, wsWorker } from './websocket/main.ts';
import { WorkerMessageType, type ConnectedMessage, type WorkerMessage } from "./websocket/message.ts";

const init_ui = () => {
  if (import.meta.env.DEV) {
    console.log("running in development server");
  }

  init_debug();
  init_event_bus();
  init_dialogs();
};

/**
 * Function that loads the state and socket management in the background
 * @returns 
 */
export const init_with_worker = async (): Promise<ConnectedMessage> => {
  // setup connection 
  const app_elem = document.querySelector<HTMLDivElement>("#app")!
  const [worker, conn_msg] = await initWebsocketWorker();
  app_elem.classList.remove("disconnected");

  worker.addEventListener("message", ev => {
    const msg: WorkerMessage = JSON.parse(ev.data);
    console.log("worker message in main thread", msg);
    switch (msg.type) {
      case WorkerMessageType.MidiFrontendInput:
        process_external(msg.data);
        break;
      case WorkerMessageType.Disconnected:
        app_elem.classList.add("disconnected");
        break;
    }
  });

  return conn_msg;
  //let status = document.querySelector<HTMLDivElement>("#connection_status")!;
}

self.addEventListener("DOMContentLoaded", () => {
  try {
    init_ui();
    init_with_worker().then(connectionInfo => {
      return fetchOverlaysAndRegister(connectionInfo.overlay_path)
    })
      .then(e => {
        setup_overlay_selector(e);
        change_overlay(0);
        console.log(e);
      })
  } catch (e) {
    alert(e);
  }
});

async function fetchOverlaysAndRegister(uri: string) {
  const o = await fetch(uri);
  const ol: Array<Overlay> = await o.json();
  return await load_overlays_from_array(ol);
}

function setup_overlay_selector(ol: LoadedOverlay[]) {
  // setup overlay chooser
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