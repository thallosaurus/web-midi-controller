import type { Overlay } from "../bindings/Overlay.ts";
import { init_event_bus, process_external } from "./event_bus.ts";
import "./style.css";
import "./ui/css/colors.css";
//import { setup_ccbutton, setup_notebutton } from "./ui/button.ts";
import { change_overlay, load_overlays_from_array, overlayUri, setup_tabs } from "./ui/overlay.ts";

import { close_dialog, init_dialogs } from './ui/dialogs.ts'
import { init_debug } from "./utils.ts";


import { init_websocket_worker } from './websocket/main.ts';

const init_ui = async (oId: number | null = null) => {
  if (import.meta.env.DEV) {
    console.log("running in development server");
  }

  init_debug();
  init_event_bus();
  init_dialogs();
  //await connect();
  //await connect_local();

  /*const overlays_parent = document.querySelector<HTMLDivElement>(
    "main#overlays",
  )!;*/

  //console.log(await overlays.json());
  //console.log("fetching overlays")
  const o = await fetch(overlayUri);
  const ol: Array<Overlay> = await o.json();
  let overlays = await load_overlays_from_array(ol);

  // setup overlay chooser
  const overlay_selector = document.querySelector<HTMLDivElement>(
    "#overlay_selector",
  )!;
  setup_tabs(ol, overlay_selector, (i) => {
    console.log("setting tab ", i)
    change_overlay(i);
    close_dialog("overlay_menu")
  });
  if (oId !== null) {
    change_overlay(oId);
  }
  //change_overlay(0);
};

// Function that loads the state and socket management in the background
const init_with_worker = async () => {

  // setup connection 
  const app_elem = document.querySelector<HTMLDivElement>("#app")!
  const ws_promise = init_websocket_worker((msg) => {
    // if we received a message that is not handled by the worker
    if (msg.type == "midi_frontend_input") {
      process_external(msg)
      return;
    }
  }).then(e => {
    //alert("connection successful")
    //debugger
    app_elem.classList.remove("disconnected")
  }).catch(e => {
    //debugger
    app_elem.classList.add("disconnected")
  });
  //return Promise.all([ws_promise]);
  return ws_promise;
  //let status = document.querySelector<HTMLDivElement>("#connection_status")!;
}

self.addEventListener("DOMContentLoaded", () => {
  try {
    init_ui(0);
    init_with_worker();
  } catch (e) {
    alert(e);
  }
});