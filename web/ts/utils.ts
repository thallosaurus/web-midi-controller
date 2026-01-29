import { init_with_worker } from "./main";
import { wsWorker, DisconnectSocketEvent, ConnectSocketEvent } from "./websocket/main";

export function vibrate() {
  if (navigator.vibrate) {
    navigator.vibrate(20);
  }
}

export function uuid(): string {
  if (crypto && crypto.randomUUID) {
    return crypto.randomUUID()
  } else {
    return pseudoUUID();
  }
}

function pseudoUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function init_debug() {
  if (import.meta.env.DEV) {
    console.log("activating development listeners");
    window.addEventListener("error", e => {
      alert("error:" + e.message + e.filename + e.lineno);
    });
    window.addEventListener("unhandledrejection", e => {
      alert("promise error:" + e.reason);
    });

    // add debug connection toggles
    let menu_connected_label = document.querySelector<HTMLDivElement>("#menu-connected-label")!;
    menu_connected_label.addEventListener("click", (e) => {
      DisconnectSocketEvent();
    })

    let menu_disconnected_label = document.querySelector<HTMLDivElement>("#menu-disconnected-label")!;
    menu_disconnected_label.addEventListener("click", (e) => {
      //ConnectSocketEvent();
      //debugger
      init_with_worker().then(e => {
        console.log("debug reconnect successful", e);
      })
    })
  }
}