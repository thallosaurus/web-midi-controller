import { JogDirection, sendUpdateJogValue } from "@eventbus/client.ts"
import type { JogwheelProperties } from "@bindings/Widget"
import { WidgetLifecycle, type WidgetState } from "@core/lifecycle"
import "./css/jogwheel.css"

export interface JogState extends WidgetState {
    active: boolean
    lastX: number
    lastTime: number
}

export class JogwheelLifecycle extends WidgetLifecycle<JogwheelProperties, JogState> {
    constructor(container: HTMLDivElement, options: JogwheelProperties) {
        super();
        let jog = document.createElement("div");
        jog.classList.add("jog-target");
        container.appendChild(jog);
    }
    load(options: JogwheelProperties, html: HTMLDivElement, state: JogState): void {
        const touch_start = (e: PointerEvent) => {
            const el = e.currentTarget as HTMLElement;
            el.setPointerCapture(e.pointerId);

            state.active = true;
            state.lastX = e.clientX;
            state.lastTime = performance.now();
        };

        const touch_move = (e: PointerEvent) => {
            if (!state.active) return;

            const now = performance.now();
            const dx = e.clientX - state.lastX;
            const dt = now - state.lastTime;

            state.lastX = e.clientX;
            state.lastTime = now;

            if (dt <= 0) return;

            const velocity = dx / dt; // px per ms

            emitJog(velocity);
        };

        const emitJog = (v: number) => {
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
                sendUpdateJogValue(options.channel, options.cc, JogDirection.Forward)
            } else {
                //process_internal(new JogEvent(s.channel, s.cc, JogDirection.Backward))
                sendUpdateJogValue(options.channel, options.cc, JogDirection.Backward)
            }
        };

        const touch_stop = (e: PointerEvent) => {
            state.active = false;
            const el = e.currentTarget as HTMLElement;
            el.releasePointerCapture(e.pointerId);
        };

        state.handlers.pointerdown = touch_start;
        state.handlers.pointermove = touch_move;
        state.handlers.pointerup = touch_stop;
        state.handlers.pointercancel = touch_stop;

        html.addEventListener("pointerdown", state.handlers.pointerdown);
        html.addEventListener("pointermove", state.handlers.pointermove);
        html.addEventListener("pointerup", state.handlers.pointerup);
        html.addEventListener("pointercancel", state.handlers.pointercancel);
    }
    unload(options: JogwheelProperties, html: HTMLDivElement, state: JogState): void {
        html.removeEventListener("pointerdown", state.handlers.pointerdown);
        html.removeEventListener("pointermove", state.handlers.pointermove);
        html.removeEventListener("pointerup", state.handlers.pointerup);
        html.removeEventListener("pointercancel", state.handlers.pointercancel);
    }
}