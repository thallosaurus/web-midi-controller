// defined all allowed widgets for type definitions - add when necessary
export type WidgetProperties = NoteButtonProperties | CCSliderProperties | CCButtonProperties | RotarySliderProperties | JogwheelProperties | XYPadProperties | GridMixerProperties | HorizontalMixerProperties | VerticalMixerProperties | ShiftAreaProperties;

import type { CCButtonProperties, CCSliderProperties, GridMixerProperties, HorizontalMixerProperties, JogwheelProperties, NoteButtonProperties, RotarySliderProperties, ShiftAreaProperties, VerticalMixerProperties, Widget, XYPadProperties } from "../../bindings/Widget.ts";
import { CCButtonLifecycle, NoteButtonLifecycle, ReactNoteButton } from "../widgets/button.tsx";
import type { Overlay } from "../../bindings/Overlay.ts";
import { JogwheelLifecycle } from "../widgets/jogwheel.ts";
import { XYPadLifecycle } from "../widgets/xypad.ts";
import { RotaryLifecycle, RotaryState } from "../widgets/rotary.ts";
import { CCSliderLifecycle, CCSliderState } from "../widgets/slider.ts";
import { LoadedOverlay, LoadedWidget } from "./overlay.tsx";
import { EmptyBox, GridMixerNew, GridMixerReact, HorizontalBox, HorizontalBoxReact, ShiftArea, VerticalBox, VerticalBoxReact } from "./Layout.tsx";
import React, { ReactNode } from "react";
//import { WidgetLifecycle, WidgetState } from "./lifecycle";

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
                return new LoadedWidget(cell, e, new VerticalBox(e, w, children));
            }

        case "horiz-mixer":
            {
                const w = cell as HorizontalMixerProperties;
                //HorizMixer(e, w, children);
                return new LoadedWidget(cell, e, new HorizontalBox(e, w, children));
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

// MARK: - React Extension

export const renderWidgetReact = (p: Widget) => {
    console.log(p.type);
    switch (p.type) {
        case "horiz-mixer":
            //return <HorizontalBoxReact { ...p }) />;
            return React.createElement(HorizontalBoxReact, { p });
        case "notebutton":
            //return (ReactNoteButton({ p }));
            return React.createElement(ReactNoteButton, { p });
        case "vert-mixer":
            return React.createElement(VerticalBoxReact, { p });
        case "grid-mixer":
            return React.createElement(GridMixerReact, { p });
        case "ccslider":
        case "ccbutton":
        case "rotary":
        case "jogwheel":
        case "xypad":
        case "shift":
        case "empty":
        default:
            return React.createElement(EmptyBox, {})
    }
}