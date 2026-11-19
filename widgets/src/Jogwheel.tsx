import { useEffect, useRef } from "react";
import { WidgetProperties } from "./Parser";
import { JogwheelProperties } from "@hdj/definitions";
import { useWidgetAction } from "./Callbacks";

export interface JogwheelState {

}

/** Renders a jogwheel control that sends direction based on pointer velocity. */
export function Jogwheel({ def }: WidgetProperties<JogwheelProperties>) {
    const active = useRef<boolean>(false);
    const lastX = useRef<number>(0);
    const lastTime = useRef<number>(0);

    const callbacks = useWidgetAction();

    /** Sends a direction value when velocity exceeds the configured deadzone. */
    const updateValue = (v: number) => {
        const abs = Math.abs(v);

        if (abs < 0.002) return; // deadzone

        if (def.output == "midi") {
            if (v > 0) {
                callbacks.send(def, 66)
            } else {
                callbacks.send(def, 64)
            }
        }
    }

    /** Captures a pointer and records its initial position and time. */
    const touch_start = ({ currentTarget, pointerId, clientX }) => {
        const el = currentTarget as HTMLElement;
        el.setPointerCapture(pointerId);

        active.current = true;
        lastX.current = clientX;
        lastTime.current = performance.now();
    };

    /** Converts pointer movement over elapsed time into jogwheel velocity. */
    const touch_move = ({ clientX }) => {
        if (!active) return;

        const now = performance.now();
        const dx = clientX - lastX.current;
        const dt = now - lastTime.current;

        lastX.current = clientX;
        lastTime.current = now;

        if (dt <= 0) return;

        const velocity = dx / dt; // px per ms

        updateValue(velocity);
    };


    /** Ends pointer capture for the active jogwheel gesture. */
    const touch_stop = ({ currentTarget, pointerId }) => {
        active.current = false;
        const el = currentTarget as HTMLElement;
        el.releasePointerCapture(pointerId);
    };

    useEffect(() => {
        const id = callbacks.register(def, (v) => {
            // doesnt update ui
        })
        return () => {
            callbacks.unregister(id, def)
        }
    }, [])

    return (
        <div className="widget jogwheel" id={def.id}
            onPointerDown={touch_start}
            onPointerMove={touch_move}
            onPointerUp={touch_stop}
            onPointerCancel={touch_stop}>
            <div className="jog-target">

            </div>
        </div>
    )
}
