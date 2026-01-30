import { init_event_bus } from "./event_bus.ts";
import "./style.css";
import "./ui/css/colors.css";

import { init_dialogs } from './ui/dialogs.ts'
import { init_debug, initWebsocketWorkerWithOverlaySelection } from "./utils.ts";

const AUTO_CONNECT_LOCAL = false;

const init_ui = () => {
  console.log("init ui")
  init_debug();
  console.log("init event bus")
  init_event_bus();
  console.log("init dialogs")
  init_dialogs();

  document.requestFullscreen({ navigationUI: 'hide' })

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
    if (AUTO_CONNECT_LOCAL) initWebsocketWorkerWithOverlaySelection();
  } catch (e) {
    alert(e);
  }
});