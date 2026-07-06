import { XYPadProperties } from "@hdj/definitions";
import { WidgetProperties } from "./Parser";
import { useEffect, useRef, useState } from "react";
import { vibrate } from "./utils";
import { useWidgetAction } from "./Callbacks";

const clamp = (v: number) => Math.min(1, Math.max(0, v));

export function XYPad({ def }: WidgetProperties<XYPadProperties>) {
    const [pressed, setPressed] = useState(false);
    const [valueX, setValueX] = useState(0);
    const [valueY, setValueY] = useState(0);

    const activePointer = useRef<number | null>(null);
    const targetRef = useRef<HTMLDivElement | null>(null);
    const callbacks = useWidgetAction();

    const sendNoteUpdate = (s: boolean) => {
        callbacks.send(def, s ? 127 : 0);
    }

    const sendAxisUpdate = (x, y) => {
        callbacks.send(def.x, x);
        callbacks.send(def.y, y);
    }

    const update = ({ clientX, clientY }) => {
        const rect = targetRef.current.getBoundingClientRect();

        const left = (clientX - rect.left)
        const x = clamp(left / rect.width);

        const bottom = clientY - rect.top
        const y = (1 - clamp((bottom) / rect.height));
        sendAxisUpdate(x, y);
    }

    const end = ({ pointerId, target, }) => {
        if (pointerId !== activePointer.current) return;
        const el = target as HTMLDivElement;
        el.releasePointerCapture(pointerId);
        activePointer.current = null;
        setPressed(false);
        sendNoteUpdate(false);
    }

    const start = ({ pointerId, target, clientX, clientY }) => {
        if (activePointer.current !== null) return;
        vibrate();
        activePointer.current = pointerId;
        const el = target as HTMLDivElement;
        el.setPointerCapture(activePointer.current);
        update({ clientX, clientY });

        sendNoteUpdate(true);
    };

    const move = ({ pointerId, clientX, clientY }) => {
        if (pointerId !== activePointer.current) return;
        update({ clientX, clientY });
    };


    useEffect(() => {
        const note_id = callbacks.register(def, (v) => { setPressed(v > 64) });
        const id_x = callbacks.register(def.x, setValueX);
        const id_y = callbacks.register(def.y, setValueY);
        return () => {
            callbacks.unregister(note_id, def);
            callbacks.unregister(id_x, def.x);
            callbacks.unregister(id_y, def.y);
        }
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
                    {Math.floor(valueX * 127)}/{Math.floor(valueY * 127)}
                </div>
            </div>
        </div>
    )
}

export function CanvasXYPad({ def }: WidgetProperties<XYPadProperties>) {
    const activePointer = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const state = useRef({ x: 0, y: 0, pressed: false });
    const callbacks = useWidgetAction();

    const sendNoteUpdate = (s: boolean) => {
        callbacks.send(def, s ? 127 : 0);
        //setPressed(s);
    }

    const sendAxisUpdate = (x, y) => {
        callbacks.send(def.x, x);
        callbacks.send(def.y, y);
    }

    const update = ({ clientX, clientY }) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = clamp((clientX - rect.left) / rect.width);
        const y = 1 - clamp((clientY - rect.top) / rect.height);

        //state.current.x = x;
        //state.current.y = y;

        sendAxisUpdate(x, y);
        draw(x, y, state.current.pressed);
    }

    const start = ({ pointerId, clientX, clientY, target }) => {

        if (activePointer.current !== null) return;
        activePointer.current = pointerId;
        const el = target as HTMLCanvasElement;
        el.setPointerCapture(pointerId);
        state.current.pressed = true;
        sendNoteUpdate(true);
        update({ clientX, clientY });

    };

    const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (e.pointerId !== activePointer.current) return;
        update({
            clientX: e.clientX,
            clientY: e.clientY,
        });

    };

    const end = ({ pointerId, target }) => {
        if (pointerId !== activePointer.current) return;
        const el = target as HTMLCanvasElement;
        el.releasePointerCapture(pointerId);
        activePointer.current = null;
        state.current.pressed = false;
        sendNoteUpdate(false);
        draw(state.current.x, state.current.y, false);

    };

    const draw = (x: number, y: number, pressed: boolean) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;

        ctx.fillStyle = "#222";
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = "#333";
        ctx.beginPath();
        ctx.moveTo(w * x, 0);
        ctx.lineTo(w * x, h);
        ctx.moveTo(0, h * (1 - y));
        ctx.lineTo(w, h * (1 - y));
        ctx.stroke();

        // knob
        ctx.fillStyle = pressed ? "#4af" : "#fff";
        ctx.beginPath();
        ctx.arc(w * x, h * (1 - y), 10, 0, Math.PI * 2);
        ctx.fill();
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        /*canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext("2d");
        ctx?.scale(dpr, dpr);*/

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        draw(state.current.x, state.current.y, state.current.pressed);

        const note_id = callbacks.register(def, (v) => {
            state.current.pressed = (v > 64)
            draw(state.current.x, state.current.y, state.current.pressed);
        });
        const id_x = callbacks.register(def.x, (v) => {
            state.current.x = v;
            draw(state.current.x, state.current.y, state.current.pressed);
        });
        const id_y = callbacks.register(def.y, (v) => {
            state.current.y = v;
            draw(state.current.x, state.current.y, state.current.pressed);
        });
        return () => {
            callbacks.unregister(note_id, def);
            callbacks.unregister(id_x, def.x);
            callbacks.unregister(id_y, def.y);
        }
    }, []);

    return (
        <div className="widget xypad" id={def.id}>
            <canvas
                ref={canvasRef}
                onPointerDown={start}
                onPointerMove={move}
                onPointerUp={end}
                onPointerCancel={end}
                style={{
                    width: "100%",
                    height: "100%",
                    touchAction: "none"
                }}
            />
        </div>
    )
}