import { XYPadProperties } from "@hdj/definitions";
import { WidgetProperties } from "./Parser.tsx";
import { useEffect, useRef, useState } from "react";
import { vibrate } from "./utils";

const clamp = (v: number) => Math.min(1, Math.max(0, v));

export function XYPad({ def, callbacks }: WidgetProperties<XYPadProperties>) {
    const [valueX, setValueX] = useState(0);
    const [valueY, setValueY] = useState(0);
    const [pressed, setPressed] = useState(false);

    const activePointer = useRef<number | null>(null);
    const targetRef = useRef<HTMLDivElement | null>(null);

    const sendUpdate = ({ valueX, valueY }) => {
        //callbacks.sendCC(def.channel, def.x.cc, valueX);
        //callbacks.sendCC(def.channel, def.y.cc, valueY);
    }

    const update = ({ clientX, clientY }) => {
        const rect = targetRef.current.getBoundingClientRect();

        const left = (clientX - rect.left)
        const x = Math.floor(clamp(left / rect.width) * 127);

        const bottom = clientY - rect.top
        const y = Math.floor((1 - clamp((bottom) / rect.height)) * 127);
        if (valueX != x) {
            setValueX(Math.floor(x))
            callbacks.sendCC(def.channel, def.x.cc, x);
        }
        if (valueY != y) {
            setValueY(Math.floor(y))
            callbacks.sendCC(def.channel, def.y.cc, y);
        }
    }

    const end = ({ pointerId, target, }) => {
        if (pointerId !== activePointer.current) return;
        const el = target as HTMLDivElement;
        el.releasePointerCapture(pointerId);
        //this.updateFromEvent(e);
        activePointer.current = null;
        setPressed(false);
        //this.target.classList.remove("pressed");
        //this.sendValue(0)
        // note update - kaoss like
        //sendUpdate({ valueX: 0, valueY: 0})
        //callbacks.sendCC()
    }

    const start = ({ pointerId, target, clientX, clientY }) => {
        if (activePointer.current !== null) return;
        vibrate();
        activePointer.current = pointerId;
        const el = target as HTMLDivElement;
        el.setPointerCapture(activePointer.current);
        update({ clientX, clientY });

        setPressed(true);
        //this.target.classList.add("pressed");

        //this.sendValue(def.velocity ?? 127)
        //sendUpdate({ valueX: def.velocity ?? 127, valueY: def.velocity ?? 127})
    };

    const move = ({ pointerId, clientX, clientY }) => {
        if (pointerId !== activePointer.current) return;
        update({ clientX, clientY });
    };


    useEffect(() => {
        callbacks.registerCC(def.channel, def.x.cc, setValueX)
        callbacks.registerCC(def.channel, def.y.cc, setValueY)
    })

    return (
        <div className="xypad">
            <button type="button" className="label y-label">{valueY} - tap to assign</button>
            <div className="target"
                ref={targetRef}
                onPointerDown={start}
                onPointerMove={move}
                onPointerCancel={end}
                onPointerUp={end}
            >{def.label ?? "XY Pad"}</div>
            <button type="button" className="label x-label">{valueX} - tap to assign</button>
        </div>
    )
}