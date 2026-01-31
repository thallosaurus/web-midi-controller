//import { init_event_bus } from "./event_bus.ts";
import "./style.css";
import "./colors.css";

import { App } from './app_state.ts'
import { setup_overlay_selector } from "./ts/common/ui_utils.ts";
import { change_overlay, load_overlays_from_array } from "./ts/ui/overlay.ts";
import { ConnectWebsocketWorkerWithHandler, initWebsocketWorker } from "@websocket/client.ts";
/* 
const init_ui = () => {


  // fix on smart devices
  if (!import.meta.env.DEV) {

    window.oncontextmenu = function (e) {

      //if (e.pointerType === "touch") {

      return false;
      //}
    }
  }
}; */

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
