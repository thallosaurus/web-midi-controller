import { CCButtonScript, NoteButtonScript, UnloadCCButtonScript, UnloadNoteButtonScript, type ButtonState } from "./button.ts";
import "./css/overlay.css";
import "./css/grid.css";
import "./css/layout.css";
import { CCSliderScript, UnloadCCSliderScript, type CCSliderState } from "./slider.ts";
import { type Overlay } from '../../bindings/Overlay.ts';
import type { GridMixerProperties, HorizontalMixerProperties, VerticalMixerProperties, Widget } from "../../bindings/Widget.ts";
import { RotaryScript, UnloadRotaryScript, type RotaryState } from "./rotary.ts";
import { render_overlay, render_widget } from "./render.ts";
import { uuid } from "../utils.ts";
import { JogwheelScript, type JogState } from "./jogwheel.ts";
import { close_dialog } from "./dialogs.ts";

let current_overlay_id = -1;
const overlay_emitter = new EventTarget();
let overlays: Array<LoadedOverlay> = [];

export function get_current_overlay_id() {
    return overlays.length
}

//export const overlayUri = "http://" + location.hostname + ":8888/overlays";

/**
 * loads overlays into the system by calling the parse function sequencially. useful for loading from json data
 * @param ol 
 * @returns The loaded overlays as parsed
 */
export function load_overlays_from_array(ol: Array<Overlay>): LoadedOverlay[] {
    let r: LoadedOverlay[] = [];
    ol.forEach(ol => {
        r.push(parse_overlay(ol));
    })
    return r;
}

/**
 * unloads the currently loaded overlays and clears the registry
 */
export function clear_loaded_overlays() {
    unload_overlay(current_overlay_id);
    overlays = []
    current_overlay_id = -1
}

/**
 * Shows a loaded overlay on the screen. Gets called by the EventEmitter
 * @param id 
 */
function load_overlay(new_overlay: LoadedOverlay) {

    const overlays_parent = document.querySelector<HTMLDivElement>(
        "main#overlays",
    )!;
    overlays_parent.appendChild(new_overlay.html);
    //const dom_overlay = document.querySelector<HTMLDivElement>("main#overlay #" + new_overlay.overlay.id)!;

    console.log(new_overlay);
    new_overlay.load()

}

/**
 * searches for the given index and unloads 
 * @param id 
 */
function unload_overlay(id: number) {
    if (id >= -1) {

        const o = overlays[id];
        if (o) {
            const overlays_parent = document.querySelector<HTMLDivElement>(
                "main#overlays",
            )!;
            o.unload();
            console.log(o);
            overlays_parent.removeChild(o.html);

            const overlay_name = document.querySelector<HTMLDivElement>(
                "#overlay_name",
            )!;
            overlay_name.innerText = "no overlay loaded";

            //const unpress_overlays = () => {
            for (const r of document.querySelectorAll<HTMLLIElement>("[data-role='overlay_switch']")!) {
                r.classList.remove("shown");
            }
        }
    } else {
        throw new Error("couldn't unload overlay" + id);
    }
}

/**
 * Creates the HTML Elements and registers the overlay in the overlay registry
 * @param overlay 
 * @returns 
 */
function parse_overlay(overlay: Overlay) {
    const oo = render_overlay(overlay, {
        id: get_current_overlay_id()
    });
    register_overlay(oo);
    return oo;
}

const register_overlay = (o: LoadedOverlay) => {
    overlays.push(o);
}

overlay_emitter.addEventListener("change", (ev: Event) => {
    //hide_all_overlays();
    //unpress_overlays();

    unload_overlay(current_overlay_id);

    const e = ev as ChangeOverlayEvent;
    //console.log(e.id);

    const new_overlay = overlays[e.id];
    if (new_overlay) {
        load_overlay(new_overlay);
        current_overlay_id = e.id;
        const o_name_elem = document.querySelector<HTMLDivElement>("#overlay_name")!;
        o_name_elem.innerText = new_overlay.overlay.name;

        for (const r of document.querySelectorAll<HTMLLIElement>("[data-role='overlay_switch'][data-overlay-index='" + e.id + "']")!) {
            r.classList.add("shown");
        }
    } else {
        throw new Error("overlay with id " + e.id + " not found")
    }

});

export interface WidgetState {
    handlers: any
}

export class LoadedWidget {
    option: Widget
    html: HTMLDivElement

    state: WidgetState
    id: string

    constructor(option: Widget, html: HTMLDivElement) {
        this.option = option;
        this.html = html;
        this.state = {
            handlers: {}
        };

        this.id = uuid();
        this.html.dataset.id = this.id;
    }
}

export class LoadedOverlay {
    overlay: Overlay
    html: HTMLDivElement
    childs: Array<LoadedWidget>
    //abort: AbortController
    id: number

    constructor(id: number, overlay: Overlay, html: HTMLDivElement, childs: Array<LoadedWidget>) {
        this.overlay = overlay;
        this.html = html
        this.childs = childs;
        //this.abort = new AbortController();
        this.id = id
    }

    unload() {
        console.log("unloading overlay id " + this.overlay.id)
        for (const o of this.childs) {
            //const elem = this.html.querySelector<HTMLDivElement>("[data-id='" + o.id + "']")

            //o.state.abort.abort();
            switch (o.option.type) {
                case "rotary":
                    UnloadRotaryScript(o.id, o.option, o.html, o.state as RotaryState);
                    break;
                case "ccbutton":
                    UnloadCCButtonScript(o.id, o.option, o.html, o.state as ButtonState);
                    break;
                case "ccslider":
                    UnloadCCSliderScript(o.id, o.option, o.html, o.state as CCSliderState);
                    break;
                case "notebutton":
                    UnloadNoteButtonScript(o.id, o.option, o.html, o.state as ButtonState);
                    break;
            }
        }

    }

    load() {
        console.log("loading overlay id " + this.overlay.id)

        for (const o of this.childs) {
            //const elem = this.html.querySelector<HTMLDivElement>("[data-id='" + o.id + "']")

            switch (o.option.type) {
                case "rotary":
                    RotaryScript(o.id, o.option, o.html, o.state as RotaryState);
                    break;
                case "ccbutton":
                    CCButtonScript(o.id, o.option, o.html, o.state as ButtonState);
                    break;
                case "ccslider":
                    CCSliderScript(o.id, o.option, o.html, o.state as CCSliderState);
                    break;
                case "notebutton":
                    NoteButtonScript(o.id, o.option, o.html, o.state as ButtonState);
                    break;
                case "jogwheel":
                    JogwheelScript(o.id, o.option, o.html, o.state as JogState);
                    break;
            }
        }
    }
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

export const HorizMixer = (container: HTMLDivElement, options: HorizontalMixerProperties, children: Array<LoadedWidget>) => {
    if (options.id) container.id = options.id;

    for (const child of options.controls) {
        const ww = render_widget(child, children);
        container.appendChild(ww.html);
        children.push(ww);
    }

    return container;
}

export const VertMixer = (container: HTMLDivElement, options: VerticalMixerProperties, children: Array<LoadedWidget>) => {
    if (options.id) container.id = options.id;

    for (const child of options.controls) {
        const ww = render_widget(child, children);
        container.appendChild(ww.html);
        children.push(ww);
    }

    return container;
}

export const setup_tabs = (ols: LoadedOverlay[], parent: HTMLDivElement, cb: (index: number) => void) => {
    //parent.classList.add("tab_parent");

    console.log(ols)
    for (let i = 0; i < ols.length; i++) {
        const t = document.createElement("li");

        t.dataset.role = "overlay_switch";
        t.dataset.overlayIndex = String(i);
        //t.
        t.innerText = String(ols[i].overlay.name);

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
