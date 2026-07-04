import { NoteButtonProperties, CCButtonProperties, osc, Widget } from "@hdj/definitions";
import { useEffect, useRef, useState } from "react";
import { WidgetProperties } from "./Parser";
import { vibrate } from "./utils";
import { useWidgetAction } from "./Callbacks";

type ButtonProperties = Widget & (NoteButtonProperties | CCButtonProperties);

export function Button({ def }: WidgetProperties<ButtonProperties>) {
    const [value, setValue] = useState(0);
    const activePointer = useRef<number | null>(null);
    const latchOn = useRef(false);
    const callbacks = useWidgetAction();

    useEffect(() => {
        const id = callbacks.register(def, (v) => {
            setValue(v);
        })
        return () => {
            callbacks.unregister(id, def)
        }
    }, [])

    const start = ({ currentTarget, pointerId }) => {
        vibrate();
        const el = currentTarget as HTMLElement;
        activePointer.current = pointerId;
        el.setPointerCapture(pointerId);

        if (def.mode == "trigger") {
            latchOn.current = true;
            callbacks.send(def, latchOn.current ? 127 : 0)
        }

    }

    const end = ({ pointerId, currentTarget }) => {
        if (pointerId !== activePointer.current) return;

        const el = currentTarget as HTMLElement;
        el.releasePointerCapture(pointerId);
        activePointer.current = null

        //el.classList.remove("press");

        if (def.mode == "trigger") {
            latchOn.current = false;
        } else if (def.mode == "latch") {
            latchOn.current = !latchOn.current;
        }

        //setValue(latchOn.current ? 127 : 0)
        callbacks.send(def, latchOn.current ? 127 : 0)
        //if (callbacks.sendNote) callbacks.sendNote(def.channel, def.note, latchOn.current ? 127 : 0, latchOn.current)
    };

    return <div id={def.id} className={`widget ${def.type}`}
        onPointerDown={start}
        onPointerUp={end}
        onPointerCancel={end}>
        <div className={"target" + " " + (value > 64 ? "press" : "")}>
            <div>
                {def.label}
            </div>
        </div >
    </div>
}