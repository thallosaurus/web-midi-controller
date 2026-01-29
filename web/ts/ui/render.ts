import type { Overlay } from "../../bindings/Overlay";
import type { CCButtonProperties, CCSliderProperties, GridMixerProperties, HorizontalMixerProperties, JogwheelProperties, NoteButtonProperties, RotarySliderProperties, VerticalMixerProperties, Widget } from "../../bindings/Widget";
import { CCButton, NoteButton } from "./button";
import { Jogwheel } from "./jogwheel";
import { HorizMixer, VertMixer, GridMixer, LoadedOverlay, LoadedWidget, type WidgetState } from "./overlay";
import { Rotary } from "./rotary";
import { CCSlider } from "./slider";

/*interface RenderLifecycle {
    load(): void;
    unload(): void;
}*/

// Converts the given Overlay to a LoadedOverlay which contains runtime variables
export const render_overlay = (overlay: Overlay, element?: HTMLDivElement): LoadedOverlay => {
    const e = element ?? document.createElement("div") as HTMLDivElement;
    let children: Array<LoadedWidget> = [];
    
    if (overlay.id) e.id = overlay.id;
    
    for (const ol of overlay.cells) {
        let w = render_widget(ol, children, overlay);
        e.append(w.html);
        children.push(w);
    }
    return new LoadedOverlay(overlay, e, children);
}

export const render_widget = (cell: Widget, children: Array<LoadedWidget>, parentOverlay: Overlay, element?: HTMLDivElement): LoadedWidget => {
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