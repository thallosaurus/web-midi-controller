import type { Overlay } from "../../bindings/Overlay";
import type { Widget } from "../../bindings/Widget";

/*interface RenderLifecycle {
    load(): void;
    unload(): void;
}*/

export const render_overlay = (overlay: Overlay, element?: HTMLDivElement): HTMLDivElement => {
    const e = element ?? document.createElement("div") as HTMLDivElement;
    
    if (overlay.id) e.id = overlay.id;
    
    for (const ol of overlay.cells) {
        e.append(render_widget(ol));
    }
    return e;
}

const render_widget = (cell: Widget, element?: HTMLDivElement): HTMLDivElement => {
    let e = element ?? document.createElement("div") as HTMLDivElement;
    e.classList.add(cell.type);

    switch (cell.type) {
        case "ccbutton":
            const button = document.createElement("div");
            button.classList.add("target");
    }
    return e
}