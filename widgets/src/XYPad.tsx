import { XYPadProperties } from "@hdj/definitions";
import { WidgetProperties } from "./Parser.tsx";
import { useEffect, useRef, useState } from "react";
import { vibrate } from "./utils";
import { useWidgetAction } from "./Callbacks.tsx";

const clamp = (v: number) => Math.min(1, Math.max(0, v));

export function XYPad({ def }: WidgetProperties<XYPadProperties>) {
    const [valueX, setValueX] = useState(0);
    const [valueY, setValueY] = useState(0);
    const [pressed, setPressed] = useState(false);

    const activePointer = useRef<number | null>(null);
    const targetRef = useRef<HTMLDivElement | null>(null);
    const callbacks = useWidgetAction();

    const sendNoteUpdate = (s: boolean) => {
        //callbacks.sendCC(def.channel, def.x.cc, valueX);
        //callbacks.sendCC(def.channel, def.y.cc, valueY);
            if (def.note) {
                //callbacks.sendNote(def.channel, def.note, def.velocity, s);
                callbacks.send(def, s ? 127 : 0);
                setPressed(s);
            }
    }

    const sendAxisUpdate = (x, y) => {
        
    }

    const update = ({ clientX, clientY }) => {
        const rect = targetRef.current.getBoundingClientRect();

        const left = (clientX - rect.left)
        const x = Math.floor(clamp(left / rect.width) * 127);

        const bottom = clientY - rect.top
        const y = Math.floor((1 - clamp((bottom) / rect.height)) * 127);
        if (valueX != x) {
            setValueX(Math.floor(x))
            //callbacks.sendCC(def.channel, def.x.cc, x);
        }
        if (valueY != y) {
            setValueY(Math.floor(y))
            //callbacks.sendCC(def.channel, def.y.cc, y);
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
        sendNoteUpdate(false);
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
        /*switch (def.output) {
            case "midi":
                {
                    const id_x = callbacks.registerCC(def.channel, def.x.cc, setValueX)
                    const id_y = callbacks.registerCC(def.channel, def.y.cc, setValueY)
                    return () => {
                        callbacks.unregisterCC(def.channel, def.x.cc, id_x);
                        callbacks.unregisterCC(def.channel, def.y.cc, id_y);
                    }
                }
            case "osc":
                {
                    const id_x = callbacks.registerOSC(def.address + "/x", (v) => {
                        setValueX(v);
                    })
                    const id_y = callbacks.registerOSC(def.address + "/y", (v) => {
                        setValueY(v);
                    })
                    return () => {
                        callbacks.unregisterOSC(def.address + "/x", id_x);
                        callbacks.unregisterOSC(def.address + "/y", id_y);
                    }
                }
        }*/
    }, [])

    return (
        <div className="widget xypad" id={def.id}>
            <div className="target"
                ref={targetRef}
                onPointerDown={start}
                onPointerMove={move}
                onPointerCancel={end}
                onPointerUp={end}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    userSelect: "none",
                    touchAction: "none"
                }}
            >
                <div style={{
                    fontWeight: pressed ? "bold" : "normal",
                    userSelect: "none",
                    touchAction: "none"
                }}>
                    {def.label ?? "XY Pad"}{pressed ? "*" : ""}
                </div>
                <div style={{
                    userSelect: "none",
                    touchAction: "none"
                }}>
                    {valueX}/{valueY}
                </div>
            </div>
        </div>
    )
}