import { Widget } from "widget-definitions"
import React from 'react';
import { Button, NoteButton } from "./Button.tsx";
import { CCSlider } from "./Slider.tsx";



export function parseWidget(def: Widget) {
  switch (def.type) {
    case 'notebutton':
      return <NoteButton note={0} id={""} channel={0} label={""} mode={"trigger"} />
    case 'ccslider':
      return <CCSlider label={""} mode={"relative"} vertical={false} id={""} channel={0} cc={0} value={0} value_off={0} default_value={0} />
    case 'ccbutton':
    case 'horiz-mixer':
    case 'vert-mixer':
    case 'grid-mixer':
    case 'rotary':
    case 'jogwheel':
    case 'xypad':
    case 'shift':
    case 'empty':
    default:
  }
}