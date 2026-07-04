import { RotarySliderProperties } from "@hdj/definitions";
import { WidgetProperties } from "./Parser";
import { vibrate } from "./utils";
import { useEffect, useRef, useState } from "react";
import { useWidgetAction } from "./Callbacks";

const sensitivity = 0.5;    // px -> value
const MIN_ANGLE = -135;
const MAX_ANGLE = 135;

export function Rotary({ def }: WidgetProperties<RotarySliderProperties>) {
    const lastX = useRef<number>(0);
    const active = useRef<boolean>(false);

    const callbacks = useWidgetAction();

    /*const send = (v: number) => {
        console.log(v);
        callbacks.send(def, v)
    }*/

    const [value, setValue] = useState<number>(0);

    const angle = () => MIN_ANGLE + (value) * (MAX_ANGLE - MIN_ANGLE);

    const touch_start = ({ target, pointerId, clientX }) => {
        const el = target as HTMLElement;
        el.setPointerCapture(pointerId);
        vibrate();
        lastX.current = clientX;
        active.current = true;
        console.log(lastX, active);
    };

    const touch_move = ({ clientX }) => {
        if (!active.current) return;

        const dx = clientX - lastX.current;
        lastX.current = clientX;

        console.log(lastX);
        const new_value = Math.max(0, Math.min(1, value + (dx * sensitivity / 127)));
        setValue(new_value);
        callbacks.send(def, new_value)
    }

    const touch_stop = ({ target, pointerId }) => {
        active.current = false;
        const el = target as HTMLElement;
        el.releasePointerCapture(pointerId);

        if (def.mode == "snapback") {
            //const reset = (def.default_value ?? 0) / 127;
            const reset = 0;
            setValue(reset);
            callbacks.send(def, reset);
        }
    }

    useEffect(() => {
        const id = callbacks.register(def, (v) => setValue(v / 127))
        return () => {
            callbacks.unregister(id, def);
        }
    }, [])

    const rotationStyle = (a) => { return { "--rotation": `${a}deg` } as React.CSSProperties }

    return (<div id={def.id} className="widget rotary" onPointerDown={touch_start} onPointerMove={touch_move} onPointerUp={touch_stop} onPointerCancel={touch_stop}>
        <div className="wwidget">
            <div className="dial" style={{
                transform: `translateX(-50%) rotate(${angle()}deg)`
            }}
            ></div>
        </div>
        <div className="label">{def.label ?? ("CC" + def.cc + ":\n" + Math.round(value * 127))}</div>
    </div>)
}