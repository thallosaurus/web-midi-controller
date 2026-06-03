import { NoteButtonProperties, CCButtonProperties, Widget } from "definitions";
import { useEffect, useRef, useState } from "react";
import { WidgetProperties } from "./Parser.tsx";
import { vibrate } from "./utils.ts";

function Button(props: { label: string, on: boolean }) {
    return <div className={"target" + " " + (props.on ? "press" : "")}>
        <div>
            {props.label}
        </div>
    </div >
}

export function NoteButton({ def, callbacks }: WidgetProperties<NoteButtonProperties>) {
    const [on, setOn] = useState(false);
    const activePointer = useRef<number | null>(null);
    const latchOn = useRef(false);

//    useEffect(() => { console.log(callbacks) })

    const start = ({ currentTarget, pointerId }) => {
        vibrate();
        const el = currentTarget as HTMLElement;
        activePointer.current = pointerId;
        el.setPointerCapture(pointerId);

        if (def.mode == "trigger") {
            //this.state.latch_on = true;
            latchOn.current = true;
            setOn(latchOn.current)
            if (callbacks.sendNote) {
                callbacks.sendNote(def.channel, def.note, latchOn.current ? 127 : 0, latchOn.current)
            }
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

        setOn(latchOn.current)
        if (callbacks.sendNote) callbacks.sendNote(def.channel, def.note, latchOn.current ? 127 : 0, latchOn.current)
    };

    return <div
        onPointerDown={start}
        onPointerUp={end}
        onPointerCancel={end}
        className="notebutton">

        <Button label={def.label} on={on} />

    </div>

}

export function CCButton({ def, callbacks }: WidgetProperties<CCButtonProperties>) {
    const [on, setOn] = useState(false);
    const activePointer = useRef<number | null>(null);
    const latchOn = useRef<boolean>(false);

    const touch_start = ({ currentTarget, pointerId }) => {
        vibrate();
        const el = currentTarget as HTMLElement;
        activePointer.current = pointerId;
        el.setPointerCapture(pointerId);

        if (def.mode == "trigger") {
            latchOn.current = true;
            touch_update();
        }
    };

    const touch_end = ({ pointerId, currentTarget }) => {
        if (pointerId !== activePointer.current) return;

        const el = currentTarget as HTMLElement;
        el.releasePointerCapture(pointerId);
        activePointer.current = null;

        //el.classList.remove("press");
        setOn(false)

        if (def.mode == "trigger") {
            latchOn.current = false;
        } else if (def.mode == "latch") {
            latchOn.current = !latchOn.current;
        }

        touch_update();
    };
    const touch_update = () => {
        //console.log(this.state.latch_on);
        if (latchOn.current) {
            callbacks.sendCC(def.channel, def.cc, def.default_value);
        } else {
            callbacks.sendCC(def.channel, def.cc, def.value_off ?? 0);
        }
    };

    return (<div className="ccbutton"

        onPointerDown={touch_start}
        onPointerUp={touch_end}
        onPointerCancel={touch_end}
    >
        <Button label={def.label} on={on} />
    </div>)
}