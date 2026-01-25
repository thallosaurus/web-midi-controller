import { vibrate } from "../main.ts";
import "./button.css";
import {
    process_internal,
    register_cc_widget,
    register_midi_widget,
} from "../event_bus.ts";
import { CCEvent, NoteEvent } from "../events.ts";

export interface CCButtonOptions {
    label?: string;
    channel: number;
    cc: number;
    value: number;
    value_off?: number;
    mode: string;
}

/// Function that mounts the Button as a child of the specified Div Element
export const setup_ccbutton = (
    parent: HTMLDivElement,
    options: CCButtonOptions,
) => {
    //let value = 0;
    let latch_on = false;
    let active_pointer: number | null = null;
    const button = document.createElement("div");
    button.classList.add("target");

    const set_label = () => {
        button.innerText = (options.label ?? "CC" + options.cc) + ":\n" +
            (latch_on ? options.value : options.value_off);
    };

    /*const _reset = () => {
        update_bus_value(options.value_off ?? 0);
    };*/

    // Update UI only
    const update_value = (v: number) => {
        //value = v;
        latch_on = v > 0;
        set_label();
        if (latch_on) {
            //latch_on = true;
            button.classList.add("press");
        } else {
            //latch_on = false;
            button.classList.remove("press");
        }
        //midi_messages.di
    };

    // Update State on the Bus
    const update_bus_value = (v: number) => {
        process_internal(new CCEvent(options.channel, v, options.cc));
    };

    // called, when the touch begins
    const touch_start = (e: PointerEvent) => {
        e.preventDefault();
        vibrate();
        const el = e.currentTarget as HTMLElement;
        active_pointer = e.pointerId;
        el.setPointerCapture(e.pointerId);

        if (options.mode == "trigger") {
            latch_on = true;
            touch_update();
        }

    };
    /*const move = (e: PointerEvent) => {
        if (e.pointerId !== active_pointer) return;
        update(e);
    }*/
    const touch_end = (e: PointerEvent) => {
        if (e.pointerId !== active_pointer) return;

        const el = e.currentTarget as HTMLElement;
        el.releasePointerCapture(e.pointerId);
        active_pointer = null;

        el.classList.remove("press");

        if (options.mode == "trigger") {
            latch_on = false;
        } else if (options.mode == "latch") {
            latch_on = !latch_on;
        }

        touch_update();
    };
    const touch_update = () => {
        console.log(latch_on);
        update_bus_value(latch_on ? options.value : (options.value_off ?? 0));
    };

    register_cc_widget(options.channel, options.cc, update_value);

    button.addEventListener("pointerdown", touch_start);
    //button.addEventListener("pointermove", move);
    button.addEventListener("pointerup", touch_end);
    button.addEventListener("pointercancel", touch_end);
    set_label();

    parent.appendChild(button);
};

export interface NoteButtonOptions {
    label?: string;
    channel: number;
    note: number;
    //velocity_on:
    mode: string;
}

export const setup_notebutton = (
    parent: HTMLDivElement,
    options: NoteButtonOptions,
) => {
    // velocity
    let latch_on = false;
    //let value = 0;
    let active_pointer: number | null = null;
    const button = document.createElement("div");
    button.classList.add("target");

    const set_label = () => {
        button.innerText = (options.label ?? "NOTE " + options.note) + ":\n" + (latch_on ? "On" : "Off")
        //value;
    };

    const touch_start = (e: PointerEvent) => {
        e.preventDefault();
        vibrate();
        const el = e.currentTarget as HTMLElement;
        active_pointer = e.pointerId;
        el.setPointerCapture(e.pointerId);

        if (options.mode == "trigger") {
            latch_on = true;
            touch_update();
        }

    };

    const touch_end = (e: PointerEvent) => {
        if (e.pointerId !== active_pointer) return;

        const el = e.currentTarget as HTMLElement;
        el.releasePointerCapture(e.pointerId);
        active_pointer = null;

        el.classList.remove("press");

        if (options.mode == "trigger") {
            latch_on = false;
        } else if (options.mode == "latch") {
            latch_on = !latch_on;
        }
        touch_update();
    };

    const update_bus_value = (v: number) => {
        process_internal(
            new NoteEvent(options.channel, options.note, v > 0, v),
        );
    };

    /*const reset = () => {
        //update_bus_value(options.value_off ?? 0);
        update_bus_value(0);
    };*/

    const touch_update = () => {
        //update_bus_value(127);
        console.log(latch_on);
        update_bus_value(latch_on ? 127 : 0);
    };

    const update_value = (n: number) => {
        //value = n;
        latch_on = n > 0;
        set_label();
        if (latch_on) {
            //latch_on = true;
            button.classList.add("press");
        } else {
            //latch_on = false;
            button.classList.remove("press");
        }
    };

    register_midi_widget(options.channel, options.note, update_value);

    button.addEventListener("pointerdown", touch_start);
    //button.addEventListener("pointermove", move);
    button.addEventListener("pointerup", touch_end);
    button.addEventListener("pointercancel", touch_end);
    set_label();

    parent.appendChild(button);
};
