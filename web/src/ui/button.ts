import { midi_messages } from "../main.ts";
import "./button.css";
import { CCEvent } from "../events.ts";

export interface CCButtonOptions {
    label?: string;
    channel: number;
    cc: number;
    value: number;
    value_off?: number;
    mode: "latch" | "trigger";
}

export const setup_ccbutton = (
    parent: HTMLDivElement,
    options: CCButtonOptions,
) => {
    let value = 0;
    let active_pointer: number | null = null
    const button = document.createElement("div");
    button.classList.add("target");

    const set_label = () => {
        button.innerText = (options.label ?? "CC" + options.cc) + ":\n" + value;
    }

    const reset = () => {
        update_value(options.value_off ?? 0);
    }

    const update_value = (v: number) => {
        value = v;
        set_label();
        //midi_messages.di
        midi_messages.dispatchEvent(new CCEvent(options.channel, value, options.cc))
    }

    const start = (e: PointerEvent) => {
        e.preventDefault();
        const el = e.currentTarget as HTMLElement;
        active_pointer = e.pointerId;
        el.setPointerCapture(e.pointerId);
        el.classList.add("press");

        update(e);
    }
    const move = (e: PointerEvent) => {
        if (e.pointerId !== active_pointer) return;
        update(e);
    }
    const end = (e: PointerEvent) => {
        if (e.pointerId !== active_pointer) return;

        const el = e.currentTarget as HTMLElement;
        el.releasePointerCapture(e.pointerId);
        active_pointer = null;

        el.classList.remove("press");

        reset();
    }
    const update = (e: PointerEvent) => {
        update_value(options.value);
    }

    button.addEventListener("pointerdown", start);
    button.addEventListener("pointermove", move);
    button.addEventListener("pointerup", end);
    button.addEventListener("pointercancel", end);
    set_label();

    parent.appendChild(button);
};

