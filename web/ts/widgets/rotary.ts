import { WidgetLifecycle, WidgetStateHandlers } from "@core/lifecycle";
import { vibrate } from "@common/ui_utils";

import type { RotarySliderProperties } from "@bindings/Widget";
import { EventBusConsumer, } from "@eventbus/client.ts";
import "./css/rotary.css";
import { App } from "../../app_state";

const MIN_ANGLE = -135;
const MAX_ANGLE = 135;

export interface RotaryState {
    //id: string | null
    value: number
    lastX: number
    active: boolean
}

export class RotaryLifecycle extends WidgetLifecycle<RotarySliderProperties, RotaryState> implements EventBusConsumer {
    widget: HTMLDivElement
    dial: HTMLDivElement
    label: HTMLDivElement

    constructor(container: HTMLDivElement, options: RotarySliderProperties) {
        super({
            value: 0,
            lastX: 0,
            active: false
        }, options);

        this.widget = document.createElement("div");
        this.widget.classList.add("widget");

        this.dial = document.createElement("div");
        this.dial.classList.add("dial");

        this.label = document.createElement("div");
        this.label.classList.add("label")

        this.widget.appendChild(this.dial);
        container.appendChild(this.widget);
        container.appendChild(this.label);
    }
    consumerId: string | null = null;
    updateValue(v: number): void {
        this.state.value = v;
        this.setElementProperties()
        console.log(v);
    }
    setElementProperties() {
        const angle = MIN_ANGLE + (this.state.value / 127) * (MAX_ANGLE - MIN_ANGLE);
        this.dial.style.setProperty("--rotation", String(angle) + "deg");
        this.label.innerText = this.prop.label ?? ("CC" + this.prop.cc + ":\n" + this.state.value)
    }

    sendValue(v: number) {
        App.eventbus.updateCC(this.prop.channel, this.prop.cc, v)
    }

    load(options: RotarySliderProperties, html: HTMLDivElement) {
        const sensitivity = 0.5;    // px -> value

        //console.log(dial);

        const touch_start = (e: PointerEvent) => {
            const el = e.target as HTMLElement;
            //alert("touch");
            //debugger;
            //console.log(el);
            el.setPointerCapture(e.pointerId);
            vibrate();
            //lastX = e.clientY;
            this.state.lastX = e.clientX;
            this.state.active = true;
        };

        const touch_move = (e: PointerEvent) => {
            if (!this.state.active) return;

            //const dy = state.lastX - e.clientX;
            const dy = e.clientX - this.state.lastX;
            this.state.lastX = e.clientX;

            const new_value = Math.floor(Math.max(0, Math.min(127, this.state.value + (dy * sensitivity))));

            if (new_value != this.state.value) {
                this.sendValue(new_value);
            }
        }

        const touch_stop = (e: PointerEvent) => {
            this.state.active = false;
            const el = e.target as HTMLElement;
            el.releasePointerCapture(e.pointerId);

            if (options.mode == "snapback") {
                this.sendValue(options.default_value ?? 0)
            }
        }

        //register_cc_widget(id, s.default_value ?? 0, s.channel, s.cc, update_value);
        //registerCCWidget(options.channel, options.cc, options.value ?? 0, this.updateValue)
        App.eventbus.registerCC(this.prop.channel, this.prop.cc, this.prop.default_value ?? 0, this).then(id => {
            this.consumerId = id;
        });

        this.handlers.pointerdown = touch_start;
        this.handlers.pointermove = touch_move;
        this.handlers.pointerup = touch_stop;
        this.handlers.pointercancel = touch_stop;
        //pointerdow
        this.setElementProperties();

        return true;
    }
    unload(options: RotarySliderProperties, html: HTMLDivElement): boolean {
        console.log("unloading rotary")

        html.removeEventListener("pointerdown", this.handlers.pointerdown);
        html.removeEventListener("pointermove", this.handlers.pointermove);
        html.removeEventListener("pointerup", this.handlers.pointerup);
        html.removeEventListener("pointercancel", this.handlers.pointercancel);
        //unregister_cc_widget(id, s.channel, s.cc);
        App.eventbus.unregisterCC(this.consumerId!,this.prop.channel, this.prop.cc);
        /*        unregisterCCWidget(this.consumerId!, options.channel, options.cc).then(() => {
                    this.consumerId = null
                })*/

        return true;
    }

}