//import { init_event_bus } from "./event_bus.ts";
import "./style.css";
import "./colors.css";

import { App } from './app_state.ts'

let app: App | null = null;

self.addEventListener("DOMContentLoaded", () => {
  app = new App();
  console.log("finished ui init")
});
