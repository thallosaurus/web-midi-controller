import { vibrate } from "../utils.ts";
import "./button.css";
import {
    process_internal,
    register_cc_widget,
    register_midi_widget,
} from "../event_bus.ts";
import { CCEvent, NoteEvent } from "../events.ts";
import { type CCButtonProperties, type NoteButtonProperties } from '../../bindings/Widget.ts';
import type { WidgetState } from "./overlay.ts";

/// Function that mounts the Button as a child of the specified Div Element
export const CCButton = (container: HTMLDivElement, options: CCButtonProperties): HTMLDivElement => {
    const button = document.createElement("div");
    button.classList.add("target");
    container.appendChild(button);
    
    return container;
}

export interface ButtonState extends WidgetState {
    latch_on: boolean,
    active_pointer: number | null
}

export const UnloadCCButtonScript = (options: CCButtonProperties, o: HTMLDivElement) => {

}

export const CCButtonScript = (options: CCButtonProperties, o: HTMLDivElement, state: ButtonState) => {
    state.latch_on = false;
    state.active_pointer = null;

    const button = o.querySelector<HTMLDivElement>(".target")!;

    const set_label = () => {
        button.innerText = (options.label ?? "CC" + options.cc) + ":\n" +
            (state.latch_on ? options.value : options.value_off);
    };

    /*const _reset = () => {
        update_bus_value(options.value_off ?? 0);
    };*/

    // Update UI only
    const update_value = (v: number) => {
        //value = v;
        state.latch_on = v > 0;
        set_label();
        if (state.latch_on) {
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
        state.active_pointer = e.pointerId;
        el.setPointerCapture(e.pointerId);

        if (options.mode == "trigger") {
            state.latch_on = true;
            touch_update();
        }
    };

    const touch_end = (e: PointerEvent) => {
        if (e.pointerId !== state.active_pointer) return;

        const el = e.currentTarget as HTMLElement;
        el.releasePointerCapture(e.pointerId);
        state.active_pointer = null;

        el.classList.remove("press");

        if (options.mode == "trigger") {
            state.latch_on = false;
        } else if (options.mode == "latch") {
            state.latch_on = !state.latch_on;
        }

        touch_update();
    };
    const touch_update = () => {
        console.log(state.latch_on);
        update_bus_value(state.latch_on ? options.value : (options.value_off ?? 0));
    };

    register_cc_widget(options.value_off ?? 0, options.channel, options.cc, update_value);

    button.addEventListener("pointerdown", touch_start);
    //button.addEventListener("pointermove", move);
    button.addEventListener("pointerup", touch_end);
    button.addEventListener("pointercancel", touch_end);
    set_label();
}

export const NoteButton = (container: HTMLDivElement, options: NoteButtonProperties): HTMLDivElement => {
    const button = document.createElement("div");
    button.classList.add("target");
    container.appendChild(button);
    return container;
}

export const UnloadNoteButtonScript = (options: NoteButtonProperties, o: HTMLDivElement) => {
    const button = o.querySelector<HTMLDivElement>(".target")!;
}

export const NoteButtonScript = (options: NoteButtonProperties, o: HTMLDivElement, state: ButtonState) => {
    // velocity
    state.latch_on = false;
    //let value = 0;
    state.active_pointer = null;

    const button = o.querySelector<HTMLDivElement>(".target")!;
    const set_label = () => {
        button.innerText = (options.label ?? "NOTE " + options.note) + ":\n" + (state.latch_on ? "On" : "Off")
        //value;
    };

    const touch_start = (e: PointerEvent) => {
        e.preventDefault();
        vibrate();
        const el = e.currentTarget as HTMLElement;
        state.active_pointer = e.pointerId;
        el.setPointerCapture(e.pointerId);

        if (options.mode == "trigger") {
            state.latch_on = true;
            touch_update();
        }

    };

    const touch_end = (e: PointerEvent) => {
        if (e.pointerId !== state.active_pointer) return;

        const el = e.currentTarget as HTMLElement;
        el.releasePointerCapture(e.pointerId);
        state.active_pointer = null;

        el.classList.remove("press");

        if (options.mode == "trigger") {
            state.latch_on = false;
        } else if (options.mode == "latch") {
            state.latch_on = !state.latch_on;
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
        console.log(state.latch_on);
        update_bus_value(state.latch_on ? 127 : 0);
    };

    const update_value = (n: number) => {
        //value = n;
        state.latch_on = n > 0;
        set_label();
        if (state.latch_on) {
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
}