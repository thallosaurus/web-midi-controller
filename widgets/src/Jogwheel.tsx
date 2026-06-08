import { useEffect, useRef } from "react";
import { WidgetProperties } from "./Parser";
import { JogwheelProperties } from "@hdj/definitions";

export interface JogwheelState {

}

export function Jogwheel({ def, callbacks }: WidgetProperties<JogwheelProperties>) {
    const active = useRef<boolean>(false);
    const lastX = useRef<number>(0);
    const lastTime = useRef<number>(0);

    const updateValue = (v: number) => {
        const abs = Math.abs(v);

        if (abs < 0.002) return; // deadzone

        if (v > 0) {
            callbacks.sendCC(this.prop.channel, this.prop.cc, 66)
        } else {
            callbacks.sendCC(this.prop.channel, this.prop.cc, 64)
        }
    }

    const touch_start = ({ currentTarget, pointerId, clientX }) => {
        const el = currentTarget as HTMLElement;
        el.setPointerCapture(pointerId);

        active.current = true;
        lastX.current = clientX;
        lastTime.current = performance.now();
    };

    const touch_move = ({ clientX }) => {
        if (!this.state.active) return;

        const now = performance.now();
        const dx = clientX - lastX.current;
        const dt = now - lastTime.current;

        this.state.lastX = clientX;
        this.state.lastTime = now;

        if (dt <= 0) return;

        const velocity = dx / dt; // px per ms

        updateValue(velocity);
    };


    const touch_stop = ({ currentTarget, pointerId }) => {
        active.current = false;
        const el = currentTarget as HTMLElement;
        el.releasePointerCapture(pointerId);
    };

    useEffect(() => {
        const id = callbacks.registerCC(def.channel, def.cc, (v) => {
            // doesnt update ui
        })
        return () => {
            callbacks.unregisterCC(def.channel, def.cc, id)
        }
    })

    return (
        <div className="jogwheel"
            onPointerDown={touch_start}
            onPointerMove={touch_move}
            onPointerUp={touch_stop}
            onPointerCancel={touch_stop}>
            <div className="jog-target">

            </div>
        </div>
    )
}