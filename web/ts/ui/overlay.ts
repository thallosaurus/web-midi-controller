import { CCButtonScript, NoteButtonScript } from "./button.ts";
import "./css/overlay.css";
import "./css/grid.css";
import "./css/layout.css";
import { CCSliderScript, setup_slider } from "./slider.ts";
import { type Overlay } from '../../bindings/Overlay.ts';
import type { GridMixerProperties, HorizontalMixerProperties, Widget } from "../../bindings/Widget.ts";
import { RotaryScript, setup_rotary } from "./rotary.ts";
import { render_widget } from "./render.ts";

let current_overlay_id = -1;
const overlay_emitter = new EventTarget();
const overlays: Array<LoadedOverlay> = [];

export const register_overlay = (o: LoadedOverlay) => {
    overlays.push(o);
}

overlay_emitter.addEventListener("change", (ev: Event) => {
    hide_all_overlays();
    unpress_overlays();
    
    const overlays_parent = document.querySelector<HTMLDivElement>(
        "main#overlays",
    )!;
    
    const current = overlays[current_overlay_id];
    if (current) {
        current.unload();
        overlays_parent.removeChild(current.html);
    }
    
    const e = ev as ChangeOverlayEvent;
    console.log(e.id);
    current_overlay_id = e.id;
    
    const new_overlay = overlays[e.id];
    if (new_overlay) {
        overlays_parent.appendChild(new_overlay.html);
        //const dom_overlay = document.querySelector<HTMLDivElement>("main#overlay #" + new_overlay.overlay.id)!;

        new_overlay.load()
    } else {
        throw new Error("overlay with id " + e.id + " not found")
    }

    //overlays[e.id].html.classList.remove("hide");
    
    /*for (const r of document.querySelectorAll<HTMLLIElement>("[data-overlay-index='"+e.id+"']")!) {
        r.classList.add("shown");
    }*/
});

export class LoadedWidget {
    option: Widget
    html: HTMLDivElement

    constructor(option: Widget, html: HTMLDivElement) {
        this.option = option;
        this.html = html;
    }
}

export class LoadedOverlay {
    overlay: Overlay
    html: HTMLDivElement
    childs: Array<LoadedWidget>

    constructor(overlay: Overlay, html: HTMLDivElement, childs: Array<LoadedWidget>) {
        this.overlay = overlay;
        this.html = html
        this.childs = childs;
    }

    unload() {
        console.log("unloading overlay id " + this.overlay.id)
    }
    
    load() {
        console.log("loading overlay id " + this.overlay.id)
        for (const o of this.childs) {
            switch(o.option.type) {
                case "rotary":
                    //console.log(dom_element);
                    //debugger;
                    RotaryScript(o.option, o.html);
                    break;
                case "ccbutton":
                    CCButtonScript(o.option, o.html);
                    break;
                case "ccslider":
                    CCSliderScript(o.option, o.html);
                    break;
                case "notebutton":
                    NoteButtonScript(o.option, o.html);
            }
        }
    }
}

const unpress_overlays = () => {
    /*for (const r of document.querySelectorAll<HTMLLIElement>("[data-role='overlay_switch']")!) {
        //r.classList.remove("shown");
    }*/
}
const hide_all_overlays = () => {
    overlays.map((v) => {
        if (!v.html.classList.contains("hide")) {
            //v.html.classList.add("hide");
        }
    });
};

class ChangeOverlayEvent extends Event {
    id: number;
    constructor(new_id: number) {
        super("change");
        this.id = new_id;
    }
}

export const change_overlay = (overlayId: number) => {
    overlay_emitter.dispatchEvent(new ChangeOverlayEvent(overlayId));
};

/*const setup_overlay_widget = (widget: Widget, vertical: boolean) => {
    const w = document.createElement("div");
    //w.classList.add(widget.type);
    if (widget.id) w.id = widget.id;

    //console.log(widget);
    w.classList.add(widget.type);
    switch (widget.type) {
        case "empty":
            // for spaces in grids
            break;
        case "ccslider":
            setup_slider(w, widget as CCSliderProperties)
            break;

        case "ccbutton":
            setup_ccbutton(w, widget as CCButtonProperties)
            break;

        case "notebutton":
            setup_notebutton(w, widget as NoteButtonProperties);
            break;

        case "rotary":
            setup_rotary(w, widget as RotarySliderProperties);
        break;
    }

    return w;
};*/

/*function _is_vertical_layout(lname: string) {
    return lname == "vert-mixer";
}*/

export const GridMixer = (container: HTMLDivElement, options: GridMixerProperties, children: Array<LoadedWidget>) => {
    //const grid = document.createElement("div");
    if (options.id) container.id = options.id;

    container.style.setProperty("--cols", String(options.w));
    container.style.setProperty("--rows", String(options.h));

    for (const child of options.controls) {
        let ww = render_widget(child, children);
        container.appendChild(ww.html);
        children.push(ww);
    }

    //container.appendChild(grid);
    return container;
}

export const FlexMixer = (container: HTMLDivElement, options: HorizontalMixerProperties, children: Array<LoadedWidget>) => {
    if (options.id) container.id = options.id;

    for (const child of options.controls) {
        const ww = render_widget(child, children)
        container.appendChild(ww.html);
        children.push(ww);
    }
    
    return container;
}

/**
 * @deprecated
 * @param options 
 * @returns 
 */
/*export const setup_overlay = (
    //parent: HTMLDivElement,
    //options: OverlayOptions,
    options: Overlay,
) => {
    const overlay = document.createElement("div");
    overlay.classList.add("overlay", "hide");
    if (options.id) overlay.id = options.id;

    // testing
    //overlay.id = "grid-demo"
    if (options.id) overlay.id = options.id;

    for (const col of options.cells) {
        const cell = document.createElement("div");
        if (col.id) cell.id = col.id;

        switch (col.type) {
            case "grid-mixer":
                cell.style.setProperty("--cols", col.w);
                cell.style.setProperty("--rows", col.h);
                break;
        }
        cell.classList.add("cell", col.type);
        for (const w of col.controls) {
            const c = setup_overlay_widget(w, is_vertical_layout(col.type));
            cell.appendChild(c);
        }
        overlay.appendChild(cell);
    }
    register_overlay(new LoadedOverlay(options, overlay));
    return overlay;
};*/

export const setup_tabs = (ols: Array<Overlay>, parent: HTMLDivElement, cb: (index: number) => void) => {
    //parent.classList.add("tab_parent");
    
    for (let i = 0; i < ols.length; i++) {
        const t = document.createElement("li");
        console.log(ols[i])

        t.dataset.role = "overlay_switch";
        t.dataset.overlayIndex = String(i);
        //t.
        t.innerText = String(ols[i].name);

        t.addEventListener("click", () => {
            //change_overlay(i);
            
            cb(i);
        });
        parent.appendChild(t);
    }
};

export const setup_chooser = (options: Array<any>, cb: (v: any) => void) => {
    options.map(cb);
};
