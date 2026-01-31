//import { init_event_bus } from "./event_bus.ts";
import "./style.css";
import "./colors.css";

import { App } from './app_state.ts'
import { setup_overlay_selector } from "./ts/common/ui_utils.ts";
import { change_overlay, load_overlays_from_array } from "./ts/ui/overlay.ts";
import { ConnectWebsocketWorkerWithHandler, initWebsocketWorker } from "@websocket/client.ts";

const init_ui = () => {


  // fix on smart devices
  if (!import.meta.env.DEV) {

    window.oncontextmenu = function (e) {

      //if (e.pointerType === "touch") {

      return false;
      //}
    }
  }
};

self.addEventListener("DOMContentLoaded", () => {
  //try {
    //init_ui();
    new App();
    console.log("finished ui init")
    /*initEventBusWorker().then(e => {
      console.log("event bus started")
    });*/

    if (import.meta.env.VITE_AUTO_CONNECT_LOCAL == "true") {

      /*init().then(e => {
        console.log("finished backend init")
      });*/
    }

  /*} catch (e) {
    alert(e);
  }*/
});

async function init() {
  //const tasks: Array<any> = []
  //let ws = await initWebsocketWorkerWithOverlaySelection();
  const app_elem = document.querySelector<HTMLDivElement>("#app")!;

  //const bus = await initEventBusWorker();
  const ws = initWebsocketWorker();
  app_elem.classList.remove("disconnected");

  // connect socket and event bus together
  /*DefaultWorkerHandler({
    socket: ws,
    eventbus: bus
  });*/

  //initWebsocketUI(ws);

  // connect to the websocket
  const conn_msg = await ConnectWebsocketWorkerWithHandler(ws); //.then(([worker, connectionInfo])

  fetch(conn_msg.overlay_path)
    .then(ol => ol.json())
    .then(ol => load_overlays_from_array(ol))
    .then((ol) => {
      setup_overlay_selector(ol);
      change_overlay(0)
    })

    // set frontend to connected
  app_elem.classList.remove("disconnected");
}

