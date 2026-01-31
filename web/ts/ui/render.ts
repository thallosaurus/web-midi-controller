import type { CCButtonProperties, CCSliderProperties, GridMixerProperties, HorizontalMixerProperties, JogwheelProperties, NoteButtonProperties, RotarySliderProperties, VerticalMixerProperties, Widget } from "@bindings/Widget";
import { CCButton, NoteButton } from "../widgets/button";
import type { Overlay } from "@bindings/Overlay";
import { Jogwheel } from "@widgets/jogwheel.ts";
import { Rotary } from "../widgets/rotary";
import { CCSlider } from "../widgets/slider";
import { HorizMixer, VertMixer, GridMixer, LoadedOverlay, LoadedWidget } from "./overlay";

// Converts the given Overlay to a LoadedOverlay which contains runtime variables
export const render_overlay = (overlay: Overlay, render_options: { element?: HTMLDivElement, id?: number }): LoadedOverlay => {
    const e = render_options.element ?? document.createElement("div") as HTMLDivElement;
    let children: Array<LoadedWidget> = [];
    
    if (overlay.id) e.id = overlay.id;
    
    for (const ol of overlay.cells) {
        let w = render_widget(ol, children);
        e.append(w.html);
        children.push(w);
    }
    return new LoadedOverlay(render_options.id ?? -1, overlay, e, children);
}

// Creates the widget Markup
export const render_widget = (cell: Widget, children: Array<LoadedWidget>, element?: HTMLDivElement): LoadedWidget => {
    let e = element ?? document.createElement("div") as HTMLDivElement;
    e.classList.add(cell.type, "widget");
    
    switch (cell.type) {
        case "ccbutton":
            {
                const w = cell as CCButtonProperties;
                //if (w.id) e.id = cell.id;
                CCButton(e, w);
            }
            break;

        case "rotary":
            {
                const w = cell as RotarySliderProperties;
                Rotary(e, w);
            }
            break;

        case "ccslider":
            {
                const w = cell as CCSliderProperties;
                CCSlider(e, w);
            }
            break;

        case "grid-mixer":
            {
                const w = cell as GridMixerProperties;
                GridMixer(e, w, children);
            }
            break;

        case "vert-mixer":
            {
                const w = cell as VerticalMixerProperties;
                VertMixer(e, w, children);
            }
            break;
            
        case "horiz-mixer":
            {
                const w = cell as HorizontalMixerProperties;
                HorizMixer(e, w, children);
            }
            break;

        case "notebutton":
            {
                const w = cell as NoteButtonProperties;
                NoteButton(e, w);
            }
            break;

        case "jogwheel":
            {
                const w = cell as JogwheelProperties;
                Jogwheel(e, w);
            }
            break;
    }
    let ww = new LoadedWidget(cell, e);
    //children.push(ww);
    return ww;
}