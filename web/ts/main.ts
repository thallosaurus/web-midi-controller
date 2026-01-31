//import { init_event_bus } from "./event_bus.ts";
import "./style.css";
import "./ui/css/colors.css";

import { init_dialogs } from './ui/dialogs.ts'
import { init_debug, initWebsocketWorkerWithOverlaySelection } from "./common/ui_utils.ts";
import { type EventBusConsumerMessage, initEventBusWorker } from "./event_bus/client.ts";

const init_ui = () => {
  console.log("init ui")
  init_debug();
  //console.log("init event bus")
  //init_event_bus();
  console.log("init dialogs")
  init_dialogs();

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
  try {
    init_ui();
    console.log("finished ui init")
    /*initEventBusWorker().then(e => {
      console.log("event bus started")
    });*/

    init().then(e => {
      console.log("finished backend init")
    });
    
  } catch (e) {
    alert(e);
  }
});

async function init() {
  //const tasks: Array<any> = []
  const bus = await initEventBusWorker();
  bus.addEventListener("message", (ev) => {
    const m: EventBusConsumerMessage = JSON.parse(ev.data);
    console.log("bus update on main", m);
  })
  //if (import.meta.env.VITE_AUTO_CONNECT_LOCAL == "true") tasks.push(initWebsocketWorkerWithOverlaySelection());
}