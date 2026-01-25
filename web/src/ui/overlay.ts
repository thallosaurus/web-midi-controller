import { setup_ccbutton, setup_notebutton } from "./button.ts";
import "./overlay.css";
import { setup_slider } from "./slider.ts";

const overlay_emitter = new EventTarget();
const overlays: Array<HTMLDivElement> = [];
const hide_all_overlays = () => {
    overlays.map((v) => {
        if (!v.classList.contains("hide")) {
            v.classList.add("hide");
        }
    });
};
overlay_emitter.addEventListener("change", (ev: Event) => {
    hide_all_overlays();

    const e = ev as ChangeOverlayEvent;
    console.log(e.id);
    overlays[e.id].classList.remove("hide");
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

const setup_overlay_widget = (widget: any, vertical: boolean) => {
    const w = document.createElement("div");
    //w.classList.add(widget.type);
    if (widget.id) w.id = widget.id;

    console.log(widget);
    switch (widget.type) {
        case "empty":
            // for spaces in grids
        break;
        case "ccslider":
            w.classList.add("ccslider");
            console.log(w);
            setup_slider(w, {
                label: widget.label,
                channel: widget.channel,
                cc: widget.cc,
                default_value: widget.default,
                mode: widget.mode,
                vertical: widget.vertical ?? vertical,
            });
            break;

        case "ccbutton":
            w.classList.add("ccbutton");
            console.log(w);
            setup_ccbutton(w, {
                cc: widget.cc,
                channel: widget.channel,
                value: widget.value,
                value_off: widget.value_off ?? 0,
                label: widget.label,
                mode: widget.mode,
            });
            break;

        case "notebutton":
            w.classList.add("notebutton");
            setup_notebutton(w, {
                label: widget.label,
                channel: widget.channel,
                note: widget.note,
                //velocity_on:
                mode: widget.mode,
            });
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
    options: any,
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
        
        switch (col.mode) {
            case "grid-mixer":
                cell.style.setProperty("--cols", col.w);
                cell.style.setProperty("--rows", col.h);
                break;
        }
        cell.classList.add("cell", col.mode);
        for (const w of col.controls) {
            const c = setup_overlay_widget(w, is_vertical_layout(col.mode));
            cell.appendChild(c);
        }
        overlay.appendChild(cell);
    }
    overlays.push(overlay);
    return overlay;
};

export const setup_tabs = (parent: HTMLDivElement) => {
    parent.classList.add("tab_parent");
    for (let i = 0; i < overlays.length; i++) {
        const t = document.createElement("a");
        t.innerText = String(i);
        t.addEventListener("click", () => {
            change_overlay(i);
        });
        parent.appendChild(t);
    }
};
