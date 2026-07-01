import { FC, useEffect, useRef, useState } from "react";
import { Widget, LoadedWidget, NoteButtonLifecycle, NoteButtonProperties, WidgetLifecycle, render_overlay, Overlay } from "midi-controller";
import { useEventBus } from "../eventbus/client";
import { LoadedOverlay } from "midi-controller/ts/core/overlay";
import { useOverlays } from "../ui/overlay";
import { GridMixerNew, HorizontalBox, ShiftArea, VerticalBox } from "midi-controller/ts/core/layout";
import { CCSliderLifecycle } from "midi-controller/ts/widgets/slider";
import { CCButtonLifecycle } from "midi-controller/ts/widgets/button";
import { RotaryLifecycle } from "midi-controller/ts/widgets/rotary";
import { JogwheelLifecycle } from "midi-controller/ts/widgets/jogwheel";
import { XYPadLifecycle } from "midi-controller/ts/widgets/xypad";

export const RenderOverlayShim: FC<{ w: Widget, c: LoadedWidget[] }> = ({ w, c }) => {
    //const eventbus = useEventBus();
    //const children = useRef<LoadedWidget[]>([]);
    const element = useRef<HTMLDivElement | null>(null);
    const eventbus = useEventBus() as any;

    const lifecycle = useRef<WidgetLifecycle<any, any> | null>(null)
    const widget = useRef<LoadedWidget | null>(null);

    useEffect(() => {
        if (element.current) {
            console.log(element.current)
            //lifecycle.current = new NoteButtonLifecycle(container.current, cell as NoteButtonProperties, eventbus as any);
            lifecycle.current = loadLifecycle();
            console.log("loaded widget:", lifecycle.current);
            widget.current = new LoadedWidget(w, element.current);

            lifecycle.current.load(w, element.current)
        }

        return () => {
            lifecycle.current.unload(w, element.current)
            //lifecycle.current = null;
        }
    }, []);

    const loadLifecycle = () => {

        switch (w.type) {
            case "horiz-mixer":
                return new HorizontalBox(element.current, w, c, eventbus);

            case "vert-mixer":
                return new VerticalBox(element.current, w, c, eventbus);

            case "grid-mixer":
                return new GridMixerNew(element.current, w, c, eventbus)

            case "notebutton":
                return new NoteButtonLifecycle(element.current, w, eventbus)

            case "ccslider":
                return new CCSliderLifecycle(element.current, w, eventbus)

            case "ccbutton":
                return new CCButtonLifecycle(element.current, w, eventbus)

            case "rotary":
                return new RotaryLifecycle(element.current, w, eventbus)

            case "jogwheel":
                return new JogwheelLifecycle(element.current, w, eventbus)

            case "xypad":
                return new XYPadLifecycle(element.current, w, eventbus)

            case "shift":
                return new ShiftArea(element.current, w, c, eventbus)

            case "empty":
            default:
                break;
        }
    };

    return (<div ref={element}></div>)
}

export const OverlayRewrite: FC<{ overlay: Overlay }> = ({ overlay }) => {
    const loadedOverlay = useRef<LoadedOverlay | null>(null);
    const { selectedOverlay, overlays } = useOverlays();

    useEffect(() => {

    });

    return (<div id="overlays">
        {overlays[selectedOverlay].cells.map((v, i) => {

        })}
    </div>)
}

export const LegacyOverlay: FC<{ overlay: Overlay, id?: number }> = ({ overlay, id }) => {
    const loadedOverlay = useRef<LoadedOverlay | null>(null);
    const { selectedOverlay } = useOverlays();
    const container = useRef<HTMLDivElement | null>(null);
    const eventbus = useEventBus();

    useEffect(() => {
        if (container) {
            const r = render_overlay(overlay, { id, element: container.current, eventbus: eventbus as any });

            loadedOverlay.current = r;
            container.current = loadedOverlay.current.html
            loadedOverlay.current.load();

            console.log(eventbus);
            console.log(loadedOverlay.current);
        }

        return () => {
            loadedOverlay.current.unload();
            loadedOverlay.current = null

            if (container.current) {
                container.current.innerText = "";
            }
        }
    }, [selectedOverlay])

    return (
        <div ref={container} data-id={selectedOverlay}></div>
    )
}