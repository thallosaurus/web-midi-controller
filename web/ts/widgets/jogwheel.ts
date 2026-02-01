import { EventBusConsumer, JogDirection, sendUpdateJogValue } from "@eventbus/client.ts"
import type { JogwheelProperties } from "@bindings/Widget"
import { WidgetLifecycle, WidgetStateHandlers } from "@core/lifecycle"
import "./css/jogwheel.css"

export interface JogState {
    active: boolean
    lastX: number
    lastTime: number
}

export class JogwheelLifecycle extends WidgetLifecycle<JogwheelProperties, JogState> implements EventBusConsumer {
    state: JogState
    prop: JogwheelProperties
    handlers: WidgetStateHandlers = {}
    
    constructor(container: HTMLDivElement, options: JogwheelProperties) {
        super();
        this.prop = options;

        this.state = {
            active: false,
            lastX: 0,
            lastTime: 0
        }

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

        /*if (abs < 0.01) {
            // Feines Scrubbing
            console.log("slow", v);
            //process_internal({ type: "jog", mode: "scrub", delta: v });
        } else {
            // Schnelles Seek
            //process_internal({ type: "jog", mode: "seek", delta: v * 1000 });
            console.log("fast", v);
        }*/
        if (v > 0) {
            //process_internal(new JogEvent(s.channel, s.cc, JogDirection.Forward))
            sendUpdateJogValue(this.prop.channel, this.prop.cc, JogDirection.Forward)
        } else {
            //process_internal(new JogEvent(s.channel, s.cc, JogDirection.Backward))
            sendUpdateJogValue(this.prop.channel, this.prop.cc, JogDirection.Backward)
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
    }

    unload(options: JogwheelProperties, html: HTMLDivElement): void {
        html.removeEventListener("pointerdown", this.handlers.pointerdown);
        html.removeEventListener("pointermove", this.handlers.pointermove);
        html.removeEventListener("pointerup", this.handlers.pointerup);
        html.removeEventListener("pointercancel", this.handlers.pointercancel);
    }
}