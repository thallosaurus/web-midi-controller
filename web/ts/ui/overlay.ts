import { setup_ccbutton, setup_notebutton } from "./button.ts";
import "./css/overlay.css";
import "./css/grid.css";
import "./css/layout.css";
import { setup_slider } from "./slider.ts";
import { type Overlay } from '../../bindings/Overlay.ts';
import type { CCButtonProperties, CCSliderProperties, NoteButtonProperties, RotarySliderProperties, Widget } from "../../bindings/Widget.ts";
import { setup_rotary } from "./rotary.ts";

const overlay_emitter = new EventTarget();
const overlays: Array<HTMLDivElement> = [];
const unpress_overlays = () => {
    for (const r of document.querySelectorAll<HTMLLIElement>("[data-role='overlay_switch']")!) {
        r.classList.remove("shown");
    }
}
const hide_all_overlays = () => {
    overlays.map((v) => {
        if (!v.classList.contains("hide")) {
            v.classList.add("hide");
        }
    });
};
overlay_emitter.addEventListener("change", (ev: Event) => {
    hide_all_overlays();
    unpress_overlays();

    const e = ev as ChangeOverlayEvent;
    console.log(e.id);
    overlays[e.id].classList.remove("hide");

    for (const r of document.querySelectorAll<HTMLLIElement>("[data-overlay-index='"+e.id+"']")!) {
        r.classList.add("shown");
    }
});

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

const setup_overlay_widget = (widget: Widget, vertical: boolean) => {
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
            /*setup_slider(w, {
                label: widget.label,
                channel: widget.channel,
                cc: widget.cc,
                default_value: widget.default,
                mode: widget.mode,
                vertical: widget.vertical ?? vertical,
            });*/
            break;

        case "ccbutton":
            setup_ccbutton(w, widget as CCButtonProperties)
            /*setup_ccbutton(w, {
                cc: widget.cc,
                channel: widget.channel,
                value: widget.value,
                value_off: widget.value_off ?? 0,
                label: widget.label,
                mode: widget.mode,
            });*/
            break;

        case "notebutton":
            setup_notebutton(w, widget as NoteButtonProperties);
/*            setup_notebutton(w, {
                label: widget.label,
                channel: widget.channel,
                note: widget.note,
                //velocity_on:
                mode: widget.mode,
            });*/
            break;

        case "rotary":
            setup_rotary(w, widget as RotarySliderProperties);
        break;
    }

    return w;
};

function is_vertical_layout(lname: string) {
    return lname == "vert-mixer";
}

export const setup_overlay = (
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
    overlays.push(overlay);
    return overlay;
};

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
