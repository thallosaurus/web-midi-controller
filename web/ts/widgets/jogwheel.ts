import { EventBusConsumer, JogDirection, sendUpdateJogValue } from "@eventbus/client.ts"
import type { JogwheelProperties } from "@bindings/Widget"
import { WidgetLifecycle, WidgetStateHandlers } from "@core/lifecycle"
import "./css/jogwheel.css"
import { App } from "../../app_state"

export interface JogState {
    active: boolean
    lastX: number
    lastTime: number
}

export class JogwheelLifecycle extends WidgetLifecycle<JogwheelProperties, JogState> implements EventBusConsumer {
    handlers: WidgetStateHandlers = {}
    
    constructor(container: HTMLDivElement, options: JogwheelProperties) {
        super({
            active: false,
            lastX: 0,
            lastTime: 0
        }, options);

        let jog = document.createElement("div");
        jog.classList.add("jog-target");
        container.appendChild(jog);
    }
    consumerId: string | null = null
    sendValue(v: number): void {
        // doesnt update a value
    }

    updateValue(v: number) {
        const abs = Math.abs(v);

        if (abs < 0.002) return; // deadzone

        if (v > 0) {
            //process_internal(new JogEvent(s.channel, s.cc, JogDirection.Forward))
            App.eventbus.updateCC(this.prop.channel, this.prop.cc, JogDirection.Forward)
        } else {
            //process_internal(new JogEvent(s.channel, s.cc, JogDirection.Backward))
            App.eventbus.updateCC(this.prop.channel, this.prop.cc, JogDirection.Backward)
        }
    }

    load(options: JogwheelProperties, html: HTMLDivElement) {
        const touch_start = (e: PointerEvent) => {
            const el = e.currentTarget as HTMLElement;
            el.setPointerCapture(e.pointerId);

            this.state.active = true;
            this.state.lastX = e.clientX;
            this.state.lastTime = performance.now();
        };

        const touch_move = (e: PointerEvent) => {
            if (!this.state.active) return;

            const now = performance.now();
            const dx = e.clientX - this.state.lastX;
            const dt = now - this.state.lastTime;

            this.state.lastX = e.clientX;
            this.state.lastTime = now;

            if (dt <= 0) return;

            const velocity = dx / dt; // px per ms

            this.updateValue(velocity);
        };


        const touch_stop = (e: PointerEvent) => {
            this.state.active = false;
            const el = e.currentTarget as HTMLElement;
            el.releasePointerCapture(e.pointerId);
        };

        this.handlers.pointerdown = touch_start;
        this.handlers.pointermove = touch_move;
        this.handlers.pointerup = touch_stop;
        this.handlers.pointercancel = touch_stop;

        App.eventbus.registerCC(this.prop.channel, this.prop.cc, 64, this);

        return true
    }

    unload(options: JogwheelProperties, html: HTMLDivElement): boolean {
        html.removeEventListener("pointerdown", this.handlers.pointerdown);
        html.removeEventListener("pointermove", this.handlers.pointermove);
        html.removeEventListener("pointerup", this.handlers.pointerup);
        html.removeEventListener("pointercancel", this.handlers.pointercancel);
        return false;
    }
}