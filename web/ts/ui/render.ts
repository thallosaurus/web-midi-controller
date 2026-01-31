// defined all allowed widgets for type definitions
export type WidgetProperties = NoteButtonProperties | CCSliderProperties | CCButtonProperties | RotarySliderProperties | JogwheelProperties;

import type { CCButtonProperties, CCSliderProperties, GridMixerProperties, HorizontalMixerProperties, JogwheelProperties, NoteButtonProperties, RotarySliderProperties, VerticalMixerProperties, Widget } from "@bindings/Widget";
import { ButtonState, CCButton, CCButtonLifecycle, NoteButton, NoteButtonLifecycle } from "@widgets/button";
import type { Overlay } from "@bindings/Overlay";
import { JogState, Jogwheel, JogwheelLifecycle } from "@widgets/jogwheel";
import { Rotary, RotaryLifecycle, RotaryState } from "@widgets/rotary";
import { CCSlider, CCSliderLifecycle, CCSliderState } from "@widgets/slider";
import { HorizMixer, VertMixer, GridMixer, LoadedOverlay, LoadedWidget } from "./overlay";
import { WidgetLifecycle, WidgetState } from "./lifecycle";

function fromWidget(o: LoadedWidget): WidgetLifecycle<WidgetProperties, WidgetState> {
        switch (o.option.type) {
            case "rotary":
                {
                    const s = new RotaryLifecycle();
                    s.load(o.option, o.html, o.state as unknown as RotaryState);
                    return s;
                }
                //RotaryScript(o.option, o.html, o.state as RotaryState);
            case "ccbutton":
                {

                    //                    CCButtonScript(o.option, o.html, o.state as ButtonState);
                    const s = new CCButtonLifecycle();
                    s.load(o.option, o.html, o.state as ButtonState);
                    return s;
                }

            case "ccslider":
                {
                    const s = new CCSliderLifecycle();
                    s.load(o.option, o.html, o.state as CCSliderState);
                    return s;
                }
            //                CCSliderScript(o.option, o.html, o.state as CCSliderState);
            //                break;
            case "notebutton":
                //NoteButtonScript(o.option, o.html, o.state as ButtonState);
                {
                    const s = new NoteButtonLifecycle();
                    s.load(o.option, o.html, o.state as ButtonState);
                    return s;
                }
            case "jogwheel":
                {
                    const s = new JogwheelLifecycle();
                    s.load(o.option, o.html, o.state as JogState);
                    return s;
                    //JogwheelScript(o.option, o.html, o.state as JogState);
                }

        }

        throw new Error("cant load lifecycle for " + o.option.type);
    }

// Converts the given Overlay to a LoadedOverlay which contains runtime variables
export function render_overlay(overlay: Overlay, render_options: { element?: HTMLDivElement, id?: number }): LoadedOverlay {
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
export function render_widget(cell: Widget, children: Array<LoadedWidget>, element?: HTMLDivElement): LoadedWidget {
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