import type { RotarySliderProperties } from "../../bindings/Widget";
import type { WidgetState } from "./overlay";
import "./css/rotary.css";
import { vibrate } from "../common/utils";
import { registerCCWidget, sendUpdateCCValue, unregisterCCWidget } from "../event_bus/client.ts";

const MIN_ANGLE = -135;
const MAX_ANGLE = 135;

export interface RotaryState extends WidgetState {
    id: string | null
    value: number
    lastX: number
    active: boolean
}

export const Rotary = (container: HTMLDivElement, _options: RotarySliderProperties): HTMLDivElement => {
    const widget = document.createElement("div");
    widget.classList.add("widget");

    const dial = document.createElement("div");
    dial.classList.add("dial");

    const label = document.createElement("div");
    label.classList.add("label")

    widget.appendChild(dial);
    container.appendChild(widget);
    container.appendChild(label);
    return container;
}

// Called, when the rotary gets displayed on the screen
export const UnloadRotaryScript = (id: string, s: RotarySliderProperties, o: HTMLDivElement, state: RotaryState) => {
    console.log("unloading rotary")

    o.removeEventListener("pointerdown", state.handlers.pointerdown);
    o.removeEventListener("pointermove", state.handlers.pointermove);
    o.removeEventListener("pointerup", state.handlers.pointerup);
    o.removeEventListener("pointercancel", state.handlers.pointercancel);
    //unregister_cc_widget(id, s.channel, s.cc);
    unregisterCCWidget(state.id!, s.channel, s.cc).then(() => {
        state.id = null
    })
}

export const RotaryScript = (id: string, s: RotarySliderProperties, o: HTMLDivElement, state: RotaryState) => {
    const sensitivity = 0.5;    // px -> value

    state.value = 0;
    state.lastX = 0;
    state.active = false;

/*    let value = 0;
    let lastX = 0;
    let active = false;*/

    const dial = o.querySelector<HTMLDivElement>(".rotary .widget .dial")!;
    const label = o.querySelector<HTMLDivElement>(".label")!;
    //console.log(dial);

    const set_element_properties = () => {
        const angle = MIN_ANGLE + (state.value/127) * (MAX_ANGLE - MIN_ANGLE);
        dial.style.setProperty("--rotation", String(angle)+"deg");
        label.innerText = s.label ?? ("CC" + s.cc + ":\n" + state.value)
    }

    const update_value = (e: number) => {
        state.value = e;
        set_element_properties()
        console.log(e);
    }

    const update_bus_value = (v: number) => {
        /*process_internal(
            new CCEvent(s.channel, v, s.cc),
        );*/
        sendUpdateCCValue(s.channel, s.cc, v)
    };

    const touch_start = (e: PointerEvent) => {
        const el = e.target as HTMLElement;
        //alert("touch");
        //debugger;
        //console.log(el);
        el.setPointerCapture(e.pointerId);
        vibrate();
        //lastX = e.clientY;
        state.lastX = e.clientX;
        state.active = true;
    };

    const touch_move = (e: PointerEvent) => {
        if (!state.active) return;

        //const dy = state.lastX - e.clientX;
        const dy = e.clientX - state.lastX;
        state.lastX = e.clientX;

        const new_value = Math.floor(Math.max(0, Math.min(127, state.value + (dy * sensitivity))));

        if (new_value != state.value) {
            update_bus_value(new_value);
        }
    }

    const touch_stop = (e: PointerEvent) => {
        state.active = false;
        const el = e.target as HTMLElement;
        el.releasePointerCapture(e.pointerId);

        if (s.mode == "snapback") {
            update_bus_value(s.default_value ?? 0)
        }
    }

    //register_cc_widget(id, s.default_value ?? 0, s.channel, s.cc, update_value);
    registerCCWidget(s.channel, s.cc, s.default_value ?? 0, update_value)
    
    state.handlers.pointerdown = touch_start;
    state.handlers.pointermove = touch_move;
    state.handlers.pointerup = touch_stop;
    state.handlers.pointercancel = touch_stop;
    //pointerdown
    o.addEventListener("pointerdown", state.handlers.pointerdown);
    o.addEventListener("pointermove", state.handlers.pointermove);
    o.addEventListener("pointerup", state.handlers.pointerup);
    o.addEventListener("pointercancel", state.handlers.pointercancel);
    set_element_properties();
}