import { NoteButtonProperties, CCButtonProperties, midi as MidiProperties, osc as OscProperties } from "@hdj/definitions";
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

    const send = (v: number) => {
        switch (def.output) {
            case "midi":
                if (callbacks.sendNote) {
                    callbacks.sendNote(def.channel, def.note, v ? 127 : 0, v > 64)
                }
                break;
            case "osc":
                if (callbacks.sendOSC) {
                    callbacks.sendOSC(def.address, [v])
                }
                break;
        }
    }

    //    useEffect(() => { console.log(callbacks) })
    useEffect(() => {
        switch (def.output) {
            case "midi":
                {

                    const id = callbacks.registerNote(def.channel, def.note, (v) => {
                        setOn(v > 64);
                    })
                    return () => {
                        callbacks.unregisterNote(def.channel, def.note, id)
                    }
                }

            case "osc":
                {
                    const id = callbacks.registerOSC(def.address, (v) => {
                        setOn(v > 64);
                    });

                    return () => {
                        callbacks.unregisterOSC(def.address, id)
                    }
                }
        }
    }, [])
    const start = ({ currentTarget, pointerId }) => {
        vibrate();
        const el = currentTarget as HTMLElement;
        activePointer.current = pointerId;
        el.setPointerCapture(pointerId);

        if (def.mode == "trigger") {
            //this.state.latch_on = true;
            latchOn.current = true;
            setOn(latchOn.current)
            /*if (callbacks.sendNote) {
                callbacks.sendNote(def.channel, def.note, latchOn.current ? 127 : 0, latchOn.current)
            }*/
            send(latchOn.current ? 127 : 0);
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
        send(latchOn.current ? 127 : 0)
        //if (callbacks.sendNote) callbacks.sendNote(def.channel, def.note, latchOn.current ? 127 : 0, latchOn.current)
    };

    return <div id={def.id}
        onPointerDown={start}
        onPointerUp={end}
        onPointerCancel={end}
        className="widget notebutton">

        <Button label={def.label ?? String(def.note)} on={on} />

    </div>

}

export function CCButton({ def, callbacks }: WidgetProperties<CCButtonProperties>) {
    const [on, setOn] = useState(false);
    const activePointer = useRef<number | null>(null);
    const latchOn = useRef<boolean>(false);

    const send = (v: number) => {
        switch (def.output) {
            case "midi":
                if (callbacks.sendCC) callbacks.sendCC(def.channel, def.cc, v);
                break;
            case "osc":
                if (callbacks.sendOSC) callbacks.sendOSC(def.address, [v])
                break;
        }
    }

    useEffect(() => {
        switch (def.output) {
            case "midi":
                {
                    const id = callbacks.registerCC(def.channel, def.cc, (v) => {
                        setOn(v > 64);
                    });
                    return () => {
                        callbacks.unregisterCC(def.channel, def.cc, id);
                    }
                }

            case "osc":
                {
                    const id = callbacks.registerOSC(def.address, (v) => {
                        setOn(v > 64);
                    });
                    return () => {
                        callbacks.unregisterOSC(def.address, id);
                    }
                }
        }
    })

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
            //callbacks.sendCC(def.channel, def.cc, def.default_value);
            send(def.default_value);
        } else {
            send(def.value_off ?? 0);
        }
    };

    return (<div id={def.id} className="widget ccbutton"

        onPointerDown={touch_start}
        onPointerUp={touch_end}
        onPointerCancel={touch_end}
    >
        <Button label={def.label} on={on} />
    </div>)
}