import { init_event_bus } from "./event_bus.ts";
import "./style.css";
import "./ui/css/colors.css";

import { init_dialogs } from './ui/dialogs.ts'
import { init_debug, initWebsocketWorkerWithOverlaySelection } from "./utils.ts";

const init_ui = () => {
  console.log("init ui")
  init_debug();
  console.log("init event bus")
  init_event_bus();
  console.log("init dialogs")
  init_dialogs();
};

self.addEventListener("DOMContentLoaded", () => {
  try {
    init_ui();
    console.log("finished ui init")
    initWebsocketWorkerWithOverlaySelection();
  } catch (e) {
    alert(e);
  }
});