import { FC, useEffect, useRef, useState } from "react";
import { Widget, LoadedWidget, NoteButtonLifecycle, NoteButtonProperties, WidgetLifecycle, render_overlay, Overlay } from "midi-controller";
import { useEventBus } from "../eventbus/client";
import { LoadedOverlay } from "midi-controller/ts/core/overlay";

export const LegacyOverlay: FC<{overlay: Overlay, id?: number }> = ({ overlay, id }) => {
    const loadedOverlay = useRef<LoadedOverlay | null>(null);
    const container = useRef<HTMLDivElement | null>(null);
    const eventbus = useEventBus();

    //const [_, forceRedraw] = useState(0);

    useEffect(() => {
        if (container) {

            loadedOverlay.current = render_overlay(overlay, { id, element: container.current, eventbus: eventbus as any });
            container.current = loadedOverlay.current.html
            loadedOverlay.current.load();

            console.log(eventbus);
            console.log(loadedOverlay.current);
        }

        return () => {
            loadedOverlay.current.unload();
            container.current.innerHTML = "";
        }
    })

    return (
        <div ref={container}></div>
    )
}

export const LegacyShim: FC<{cell: Widget}> = ({ cell }) => {
    const container = useRef<HTMLDivElement | null>(null);
    const lifecycle = useRef<NoteButtonLifecycle | null>(null)
    const widget = useRef<LoadedWidget | null>(null);
    const eventbus = useEventBus();

    useEffect(() => {
        if (container.current) {
            console.log(container.current)
            lifecycle.current = new NoteButtonLifecycle(container.current, cell as NoteButtonProperties, eventbus);
            widget.current = new LoadedWidget(cell, container.current, lifecycle.current as unknown as WidgetLifecycle<any, any>);
            console.log("loaded widget:", widget.current);

            lifecycle.current.load(cell as unknown as NoteButtonProperties, container.current)
        }

        return () => {
            lifecycle.current.unload(cell as unknown as NoteButtonProperties, container.current)
        }
    }, []);

    return (<div ref={container}></div>)
}