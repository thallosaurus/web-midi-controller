import type { Overlay } from "../bindings/Overlay.ts";
import { init_event_bus } from "./event_bus.ts";
import "./style.css";
import "./ui/css/colors.css";
//import { setup_ccbutton, setup_notebutton } from "./ui/button.ts";
import { change_overlay, init_overlays, register_overlay, setup_tabs } from "./ui/overlay.ts";
import { render_overlay } from "./ui/render.ts";
//import { setup_slider } from "./ui/slider.ts";
import { connect, disconnect } from "./websocket.ts";
import { init_dialogs } from './dialogs.ts'
import { init_debug } from "./utils.ts";


import { init_websocket_worker } from './workers/ws_worker';

const init = async () => {
  init_debug();
  init_event_bus();
  init_dialogs();
  //await connect();
  //await connect_local();

  /*const overlays_parent = document.querySelector<HTMLDivElement>(
    "main#overlays",
  )!;*/
  if (import.meta.env.DEV) {
    console.log("dev");
  }

  //console.log(await overlays.json());

  await init_overlays();
  change_overlay(0);
  document.querySelector<HTMLDivElement>("#connection_status")!.addEventListener(
    "click",
    async (_ev) => {
      disconnect();
      connect();
    },
  );
};

// Function that loads the state and socket management in the background
const init_with_worker = async () => {
  
  let status = document.querySelector<HTMLDivElement>("#connection_status")!;
  if (await init_websocket_worker()) {
    status.innerText = "connected";
  }
}

self.addEventListener("DOMContentLoaded", () => {
  try {
    init();
    init_with_worker();
  } catch (e) {
    alert(e);
  }
});