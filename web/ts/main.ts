import type { Overlay } from "../bindings/Overlay.ts";
import { init_event_bus } from "./event_bus.ts";
import "./style.css";
//import { setup_ccbutton, setup_notebutton } from "./ui/button.ts";
import { change_overlay, register_overlay, setup_tabs } from "./ui/overlay.ts";
import { render_overlay } from "./ui/render.ts";
//import { setup_slider } from "./ui/slider.ts";
import { connect_local } from "./websocket.ts";
import { close_dialog, init_dialogs, open_dialog } from './dialogs.ts'
import { init_debug } from "./utils.ts";

const init = async () => {
  //init_debug();
  init_event_bus();
  init_dialogs();
  connect_local();

  /*const overlays_parent = document.querySelector<HTMLDivElement>(
    "main#overlays",
  )!;*/
  if (import.meta.env.DEV) {
    console.log("dev");
  }
  const overlays = await fetch(
    import.meta.env.DEV ? "demo_overlay.json" : "overlays",
  );
  //console.log(await overlays.json());

  const ol: Array<Overlay> = await overlays.json();

  for (
    //const overlay of document.querySelectorAll<HTMLDivElement>("div.overlay")!
    const overlay of ol
  ) {
    // Test Render Flow here
    const oo = render_overlay(overlay);
    register_overlay(oo);
    console.log(oo);
    //debugger;
  }

  const overlay_selector = document.querySelector<HTMLDivElement>(
    "#overlay_selector",
  )!;
  setup_tabs(ol, overlay_selector, (i) => {
    console.log("setting tab ", i)
    change_overlay(i);
    close_dialog("overlay_menu")
  });
  
  /*const slide_menu = document.querySelector<HTMLDivElement>(
    "#overlay_menu_activator",
  )!;
  slide_menu.addEventListener("click", () => {
    open_dialog("overlay_menu")
  })*/

  /*const slide_menu_close = document.querySelector<HTMLDivElement>(
    "dialog#overlay_menu button#close",
  )!;
  slide_menu_close.addEventListener("click", () => {
    close_dialog("overlay_menu")
  })*/
  
  change_overlay(0);
};

self.addEventListener("DOMContentLoaded", () => {
  try {

    init();
  } catch (e) {
    alert(e);
  }
});

document.querySelector<HTMLDivElement>("#connection_status")!.addEventListener(
  "click",
  (_ev) => {
    connect_local();
  },
);



export default {};

