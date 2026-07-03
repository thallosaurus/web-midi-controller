import { RotarySliderProperties } from "@hdj/definitions";
import { WidgetProperties } from "./Parser.tsx";
import { vibrate } from "./utils";
import { useEffect, useRef, useState } from "react";
import { useWidgetAction } from "./Callbacks.tsx";

const sensitivity = 0.5;    // px -> value
const MIN_ANGLE = -135;
const MAX_ANGLE = 135;

export function Rotary({ def }: WidgetProperties<RotarySliderProperties>) {
    const lastX = useRef<number>(0);
    const active = useRef<boolean>(false);

    const callbacks = useWidgetAction();

    const send = (v: number) => {
        callbacks.send(def, v)
    }

    const [value, setValue] = useState<number>(def.default_value ?? 0);

    const angle = () => MIN_ANGLE + (value / 127) * (MAX_ANGLE - MIN_ANGLE);

    const touch_start = ({ target, pointerId, clientX }) => {
        const el = target as HTMLElement;
        el.setPointerCapture(pointerId);
        vibrate();
        lastX.current = clientX;
        active.current = true;
    };

    const touch_move = ({ clientX }) => {
        if (!active.current) return;

        const dx = clientX - lastX.current;
        lastX.current = clientX;

        const new_value = Math.floor(Math.max(0, Math.min(127, value + (dx * sensitivity))));

        /*if (new_value != value) {
            //setValue(new_value)
            }*/
       send(new_value)
    }

    const touch_stop = ({ target, pointerId }) => {
        active.current = false;
        const el = target as HTMLElement;
        el.releasePointerCapture(pointerId);

        if (def.mode == "snapback") {
            //setValue(def.default_value ?? 0)
            //callbacks.sendCC(def.channel, def.cc, def.default_value ?? 0)
            send(def.default_value ?? 0)
        }
    }

    useEffect(() => {
        const id = callbacks.register(def, setValue)
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
        <div className="label">{def.label ?? ("CC" + def.cc + ":\n" + value)}</div>
    </div>)
}