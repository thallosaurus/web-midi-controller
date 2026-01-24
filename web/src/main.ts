import "./style.css";
import { setup_ccbutton, setup_notebutton } from "./ui/button.ts";
import { change_overlay, setup_overlay, setup_tabs } from "./ui/overlay.ts";
import { setup_slider } from "./ui/slider.ts";
import { connect_local } from "./websocket.ts";

export function vibrate() {
  if (navigator.vibrate) {
    navigator.vibrate(20);
  }
}

const close_dialog = (id: string) => {
  const dialog = document.querySelector<HTMLDialogElement>("dialog#" + id)!;
  console.log(dialog);
  dialog.close("close");
};

const open_dialog = (id: string) => {
  const dialog = document.querySelector<HTMLDialogElement>("dialog#" + id)!;
  dialog.showModal();
};

const init = () => {
  connect_local();
  for (
    const overlay of document.querySelectorAll<HTMLDivElement>("div.overlay")!
  ) {
    setup_overlay(overlay);
  }
  for (
    const ccslider of document.querySelectorAll<HTMLDivElement>("div.ccslider")!
  ) {
    const channel = parseInt(ccslider.dataset.channel ?? "1");
    const cc = parseInt(ccslider.dataset.cc ?? "0");
    const mode = ccslider.dataset.mode ?? "absolute";
    const label = ccslider.dataset.label;
    setup_slider(ccslider, {
      channel,
      cc,
      mode,
      label,
    });
  }

  for (
    const ccbutton of document.querySelectorAll<HTMLDivElement>("div.ccbutton")!
  ) {
    const channel = parseInt(ccbutton.dataset.channel ?? "0");
    const cc = parseInt(ccbutton.dataset.cc ?? "0");
    const value = parseInt(ccbutton.dataset.value ?? "127");
    const value_off = parseInt(ccbutton.dataset.value_off ?? "0");
    const label = ccbutton.dataset.label;
    const mode = ccbutton.dataset.mode ?? "trigger";
    setup_ccbutton(ccbutton, {
      cc,
      channel,
      value,
      value_off,
      label,
      mode,
    });
  }

  for (
    const ccbutton of document.querySelectorAll<HTMLDivElement>(
      "div.notebutton",
    )!
  ) {
    const channel = parseInt(ccbutton.dataset.channel ?? "0");
    const note = parseInt(ccbutton.dataset.note ?? "0");
    const value = parseInt(ccbutton.dataset.value ?? "127");
    const value_off = parseInt(ccbutton.dataset.value_off ?? "0");
    const label = ccbutton.dataset.label;
    const mode = ccbutton.dataset.mode ?? "trigger";
    setup_notebutton(ccbutton, {
      note,
      channel,
      value,
      value_off,
      label,
      mode,
    });
  }

  const overlay_selector = document.querySelector<HTMLDivElement>(
    "#overlay_selector",
  )!;
  setup_tabs(overlay_selector);
  change_overlay(0);
};

self.addEventListener("DOMContentLoaded", init);

document.querySelector<HTMLButtonElement>("#menu_container button")!
  .addEventListener("click", (_ev) => {
    //open dialog
    open_dialog("menu");
  });

document.querySelector<HTMLDivElement>("#connection_status")!.addEventListener(
  "click",
  (_ev) => {
    connect_local();
  },
);

document.querySelector<HTMLButtonElement>(
  "dialog footer button[data-role='close']",
)!.addEventListener("click", (_ev: MouseEvent) => {
  const target = (_ev.target! as HTMLButtonElement).dataset.target;
  close_dialog(target!);
});

export default {};
