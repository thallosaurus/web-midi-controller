//import { init_event_bus } from "./event_bus.ts";
import "./style.css";
import "./colors.css";

import { App } from './app_state.ts'
import { connectSocketMessage } from "@websocket/client.ts";
import { wsUri } from "@websocket/websocket.ts";

let app: App | null = null;

self.addEventListener("DOMContentLoaded", () => {
  //try {
    app = new App();
    console.log("finished ui init")

  /*} catch (e) {
    alert(e);
  }*/
});
