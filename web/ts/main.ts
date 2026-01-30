import { init_event_bus } from "./event_bus.ts";
import "./style.css";
import "./ui/css/colors.css";

import { init_dialogs } from './ui/dialogs.ts'
import { init_debug, initWebsocketWorkerWithOverlaySelection } from "./utils.ts";

const init_ui = () => {
  if (import.meta.env.DEV) {
    console.log("running in development server");
  }

  init_debug();
  init_event_bus();
  init_dialogs();
};

self.addEventListener("DOMContentLoaded", () => {
  try {
    init_ui();
    initWebsocketWorkerWithOverlaySelection();
  } catch (e) {
    alert(e);
  }
});