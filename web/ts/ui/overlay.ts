import "./css/overlay.css";
import "./css/grid.css";
import "./css/layout.css";
import { AllowedWidgetProperties, type Overlay } from "@bindings/Overlay.ts";
import { uuid } from "@common/utils.ts";

// widget imports
import type { GridMixerProperties, HorizontalMixerProperties, VerticalMixerProperties, Widget } from "@bindings/Widget.ts";
import { render_overlay, render_widget, WidgetProperties } from "./render";
import { WidgetLifecycle, WidgetStateHandlers } from "./lifecycle";
//import { RotaryLifecycle, UnloadRotaryScript, type RotaryState } from "@widgets/rotary";

let current_overlay_id = -1;
const overlay_emitter = new EventTarget();
let overlays: Array<LoadedOverlay> = [];

export function get_current_overlay_id() {
    return overlays.length
}

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
    current_overlay_id = -1
    overlays = []
}

function set_overlay_label_html(label: string) {
    document.querySelectorAll<HTMLDivElement>(
        "[data-role='overlay_name']",
    )!.forEach(e => {
        e.innerText = label;
    });
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

            set_overlay_label_html(
                "no overlay loaded"
            );

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
        set_overlay_label_html(new_overlay.overlay.name);

        for (const r of document.querySelectorAll<HTMLLIElement>("[data-role='overlay_switch'][data-overlay-index='" + e.id + "']")!) {
            r.classList.add("shown");
        }
    } else {
        throw new Error("overlay with id " + e.id + " not found")
    }

});

export class LoadedWidget {
    option: Widget
    html: HTMLDivElement

    //state: WidgetState
    id: string

    lifecycle: WidgetLifecycle<WidgetProperties, any> | null = null

    constructor(option: Widget, html: HTMLDivElement, lifecycle?: WidgetLifecycle<WidgetProperties, any>) {
        this.option = option;
        this.html = html;

        this.id = uuid();
        this.html.dataset.id = this.id;

        if (lifecycle) {
            this.lifecycle = lifecycle;
        }
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

            //o.state.abort.abort();
            if (o.lifecycle) {
                o.lifecycle.unload(o.option as WidgetProperties, o.html);

                Object.entries(o.lifecycle.handlers).forEach(([k, h]) => {
                    console.log(k, h);

                    if (k == "pointerdown") {
                        o.html.removeEventListener("pointerdown", h)
                    }

                    if (k == "pointermove") {
                        o.html.removeEventListener("pointermove", h);
                    }

                    if (k == "pointerup") {
                        o.html.removeEventListener("pointerup", h);
                    }

                    if (k == "pointercancel") {

                        o.html.removeEventListener("pointercancel", h);
                    }
                });
                o.lifecycle = null
            }
        }
    }




            load() {
                console.log("loading overlay id " + this.overlay.id)

                for (const o of this.childs) {
                    if (o.lifecycle) {

                        const should_listen = o.lifecycle.load(o.option as unknown as any, o.html);
                        // TODO correct this
                        Object.entries(o.lifecycle.handlers).forEach(([k, h]) => {
                            console.log(k, h);

                            if (k == "pointerdown") {
                                o.html.addEventListener("pointerdown", h)
                            }

                            if (k == "pointermove") {
                                o.html.addEventListener("pointermove", h);
                            }

                            if (k == "pointerup") {
                                o.html.addEventListener("pointerup", h);
                            }

                            if (k == "pointercancel") {

                                o.html.addEventListener("pointercancel", h);
                            }
                        })
                    }
                }

            }
        }

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
