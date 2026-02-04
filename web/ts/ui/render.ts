// defined all allowed widgets for type definitions - add when necessary
export type WidgetProperties = NoteButtonProperties | CCSliderProperties | CCButtonProperties | RotarySliderProperties | JogwheelProperties | XYPadProperties | GridMixerProperties | HorizontalMixerProperties | VerticalMixerProperties | ShiftAreaProperties;

import type { CCButtonProperties, CCSliderProperties, GridMixerProperties, HorizontalMixerProperties, JogwheelProperties, NoteButtonProperties, RotarySliderProperties, ShiftAreaProperties, VerticalMixerProperties, Widget, XYPadProperties } from "@bindings/Widget";
import { CCButtonLifecycle, NoteButtonLifecycle } from "@widgets/button";
import type { Overlay } from "@bindings/Overlay";
import { JogwheelLifecycle } from "@widgets/jogwheel";
import { XYPadLifecycle } from "@widgets/xypad";
import { RotaryLifecycle, RotaryState } from "@widgets/rotary";
import { CCSliderLifecycle, CCSliderState } from "@widgets/slider";
import { LoadedOverlay, LoadedWidget } from "./overlay";
import { FlexBox, GridMixerNew, ShiftArea } from "./layout";
//import { WidgetLifecycle, WidgetState } from "./lifecycle";

/*export function fromWidget(o: LoadedWidget): WidgetLifecycle<WidgetProperties, WidgetState> | null{
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
        return null
    }*/

// Converts the given Overlay to a LoadedOverlay which contains runtime variables and renders it into the given element
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
                //CCButton(e, w);
                return new LoadedWidget(cell, e, new CCButtonLifecycle(e, w))
            }

        case "rotary":
            {
                const w = cell as RotarySliderProperties;
                //Rotary(e, w);
                return new LoadedWidget(cell, e, new RotaryLifecycle(e, w))
            }

        case "ccslider":
            {
                const w = cell as CCSliderProperties;
                //CCSlider(e, w);
                return new LoadedWidget(cell, e, new CCSliderLifecycle(e, w))
            }

        case "grid-mixer":
            {
                const w = cell as GridMixerProperties;
                //GridMixer(e, w, children);
                return new LoadedWidget(cell, e, new GridMixerNew(e, w, children));
            }

        case "vert-mixer":
            {
                const w = cell as VerticalMixerProperties;
                //VertMixer(e, w, children);
                return new LoadedWidget(cell, e, new FlexBox(e, w, children));
            }

        case "horiz-mixer":
            {
                const w = cell as HorizontalMixerProperties;
                //HorizMixer(e, w, children);
                return new LoadedWidget(cell, e, new FlexBox(e, w, children));
            }

        case "notebutton":
            {
                const w = cell as NoteButtonProperties;
                //NoteButton(e, w);
                return new LoadedWidget(cell, e, new NoteButtonLifecycle(e, w))
            }

        case "jogwheel":
            {
                const w = cell as JogwheelProperties;
                return new LoadedWidget(cell, e, new JogwheelLifecycle(e, w));
                //Jogwheel(e, w);
            }

        case "xypad":
            {
                const w = cell as XYPadProperties;
                return new LoadedWidget(cell, e, new XYPadLifecycle(e, w));
            }

        case "shift":
            {
                const w = cell as ShiftAreaProperties;
                return new LoadedWidget(cell, e, new ShiftArea(e, w, children));
            }
    }
    let ww = new LoadedWidget(cell, e);
    //children.push(ww);
    return ww;
}