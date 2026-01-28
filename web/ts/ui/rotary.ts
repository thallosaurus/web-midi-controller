import type { RotarySliderProperties } from "../../bindings/Widget";
import { process_internal, register_cc_widget } from "../event_bus";
import { CCEvent } from "../events";
import "./rotary.css";

const MIN_ANGLE = -135;
const MAX_ANGLE = 135;

export const setup_rotary = (
    parent: HTMLDivElement,
    options: RotarySliderProperties,
) => {

    //parent.classList.add("fill");

    const widget = document.createElement("div");
    widget.classList.add("widget");

    const dial = document.createElement("div");
    dial.classList.add("dial");
    
    const sensitivity = 0.5;    // px -> value
    
    let value = 0;
    
    let lastX = 0;
    let active = false;
    
    const set_element_properties = () => {
        //parent.innerText = options.label ?? "fuck you";
        //widget.innerText = (options.label ?? "fuck you") + ": " + value;
        const angle = MIN_ANGLE + (value/127) * (MAX_ANGLE - MIN_ANGLE);
        dial.style.setProperty("--rotation", String(angle)+"deg");
    }

    const update_value = (e: number) => {
        value = e;
        set_element_properties()
    }

    const update_bus_value = (v: number) => {
        process_internal(
            new CCEvent(options.channel, v, options.cc),
        );
    };

    const touch_start = (e: PointerEvent) => {
        const el = e.currentTarget as HTMLElement;
        el.setPointerCapture(e.pointerId);
        lastX = e.clientY;
        active = true;
    };

    const touch_move = (e: PointerEvent) => {
        if (!active) return;

        const dy = lastX - e.clientX;
        lastX = e.clientX;

        const new_value = Math.floor(Math.max(0, Math.min(127, value + (dy * sensitivity))));

        if (new_value != value) {
            update_bus_value(new_value);
        }
    }

    const touch_stop = (e: PointerEvent) => {
        active = false;
        const el = e.currentTarget as HTMLElement;
        el.releasePointerCapture(e.pointerId);

        if (options.mode == "snapback") {
            update_bus_value(options.default_value ?? 0)
        }
    }

    register_cc_widget(options.default_value ?? 0, options.channel, options.cc, update_value);
    
    //pointerdown
    parent.addEventListener("pointerdown", touch_start);
    parent.addEventListener("pointermove", touch_move);
    parent.addEventListener("pointerup", touch_stop);
    parent.addEventListener("pointercancel", touch_stop);
    set_element_properties();

    widget.appendChild(dial);
    parent.appendChild(widget);
}