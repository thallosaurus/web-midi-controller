import "./style.css";
import { setup_ccbutton } from "./ui/button.ts";
import { setup_slider } from "./ui/slider.ts";
import { CCEvent } from "./events";
import ws from "./websocket";

export const midi_messages = new EventTarget();

const init = () => {
  midi_messages.addEventListener("ccupdate", (update: CCEvent) => {
    console.log(update);
    ws.send(JSON.stringify(update));
  });

  for (const ccslider of document.querySelectorAll<HTMLDivElement>("div.ccslider")!) {
    const { channel, cc, mode, label } = ccslider.dataset;
    console.log(channel, cc, mode, label);
    setup_slider(ccslider, {
      channel,
      cc,
      mode,
      label
    });
  }

  for (const ccbutton of document.querySelectorAll<HTMLDivElement>("div.ccbutton")!) {
    const { channel, cc, value, value_off, label } = ccbutton.dataset;
    console.log(channel, cc);
    setup_ccbutton(ccbutton, {
      cc,
      channel,
      value: parseInt(value),
      value_off,
      label
    })
  }
};

window.addEventListener("DOMContentLoaded", () => {
  init();
});
