import { CCSliderProperties, SliderMode } from "@hdj/definitions";
import { WidgetProperties } from "./Parser";
import { useEffect, useRef, useState } from "react";
import { vibrate } from "./utils";
import { useWidgetAction } from "./Callbacks";

const MAX_LEVEL = 1.0;

/** Converts a normalized value to a percentage for slider fill styles. */
const growFactor = (value) => {
    return (value / MAX_LEVEL) * 100 + "%";
}

/** Creates the fill styles used for a vertically oriented slider. */
const verticalFillStyle = (value, type: SliderMode) => {
    return { width: growFactor(value), borderRight: `1em solid var(--${type})`, height: "100%", left: 0 }
}

/** Creates the fill styles used for a horizontally oriented slider. */
const horizontalFillStyle = (value, type: SliderMode) => {
    return { height: growFactor(value), borderTop: `1em solid var(--${type})`, width: "100%", bottom: 0 }
}

/** Returns the base CSS styles for a vertical slider. */
const verticalSliderStyle = () => {
    return {
        width: "100%",
        "userSelect": "none",
        "-webkit-user-select": "none",
    } as React.CSSProperties
}

/** Returns the base CSS styles for a horizontal slider. */
const horizontalSliderStyle = () => {
    return {
        height: "100%",
        "userSelect": "none",
        "-webkit-user-select": "none"
    } as React.CSSProperties
}

/** Returns the container styles for a vertical control-change slider. */
const verticalCCSliderStyle = () => {
    return {
        width: "100%",
        alignItems: "center"
    }
}

/** Returns the container styles for a horizontal control-change slider. */
const horizontalCCSliderStyle = () => {
    return {
        height: "100%",
        alignItems: "center"
    }
}

//const horizontal

/** Renders a control-change slider with absolute, relative or snapback behavior. */
export function Slider({ def }: WidgetProperties<CCSliderProperties>) {
    const [value, setValue] = useState(0);

    const baseValue = useRef<number>(0);
    const baseX = useRef<number>(0);
    const baseY = useRef<number>(0);
    const activePointer = useRef<number | null>(null);

    const callbacks = useWidgetAction();

    /** Sends a normalized value for this slider definition. */
    const send = (v: number) => {
        callbacks.send(def, v);
    }

    useEffect(() => {
        console.log("ccslider effect", def.cc)
        const id = callbacks.register(def, setValue);
        return () => {
            callbacks.unregister(id, def)
        }
    }, [])

    /** Captures a pointer and records the starting coordinates and value. */
    const start = ({ currentTarget, pointerId, clientX, clientY }) => {
        //preventDefault();
        vibrate();
        const el = currentTarget as HTMLElement;

        activePointer.current = pointerId;
        el.setPointerCapture(pointerId);

        baseValue.current = value;

        baseY.current = clientY;
        baseX.current = clientX;

        update({ target: el, clientY, clientX });
    };

    /** Updates the slider value while its active pointer moves. */
    const move = ({ target, clientY, clientX, pointerId }) => {
        if (pointerId !== activePointer.current) return;
        update({ target, clientY, clientX });
    };

    /** Releases the pointer and resets or updates the slider on release. */
    const end = ({ target, pointerId, clientX, clientY }) => {
        if (pointerId !== activePointer.current) return;

        const el = target as HTMLElement;
        el.releasePointerCapture(pointerId);
        activePointer.current = null;

        if (def.mode == "snapback") {
            reset();
        } else {
            update({ target, clientX, clientY })
        }
    };

    /** Resets the slider value to zero and sends the reset value. */
    const reset = () => {
        //setValue((def.default_value ?? 0) / 127);
        setValue(0);
        send(0);
        //send((def.default_value ?? 0) / 127);
        //if (callbacks.sendCC) callbacks.sendCC(def.channel, def.cc, def.default_value ?? 0);
        //this.eventbus!.updateCC(this.prop.channel, this.prop.cc, def.default_value ?? 0);
    };

    /** Computes a normalized slider value from pointer coordinates and mode. */
    const update = ({ target, clientY, clientX }) => {
        const rect = (target as HTMLElement).getBoundingClientRect();

        switch (def.mode) {
            case "snapback":
            case "absolute":
                {
                    let v: number;
                    if (!def.vertical) {
                        const n = rect.bottom - clientY;
                        v =
                            Math.max(
                                0,
                                Math.min(
                                    MAX_LEVEL,
                                    (n / rect.height) * MAX_LEVEL,
                                ),
                            );
                    } else {
                        const n = clientX - rect.left;
                        v = Math.max(
                            0,
                            Math.min(
                                (n / rect.width) * MAX_LEVEL,
                                MAX_LEVEL,
                            ),
                        );
                    }
                    if (v != value) {
                        //update_value(v);
                        //console.log(rect);
                        //console.log(v);
                        //this.sendValue(v);
                        //setValue(v)
                        //if (callbacks.sendCC) callbacks.sendCC(def.channel, def.cc, value);
                        send(v);
                    }
                }
                break;

            case "relative":
                {
                    let v;
                    if (!def.vertical) {
                        const n = baseY.current - clientY;
                        const sensitivity = MAX_LEVEL / (rect.height);
                        const next = baseValue.current + n * sensitivity;
                        //(options.vertical ? (rect.width) : (rect.height));
                        v = Math.max(0, Math.min(MAX_LEVEL, next))
                    } else {
                        const delta = clientX - baseX.current;
                        const sensitivity = MAX_LEVEL / rect.width;
                        const next = baseValue.current + delta * sensitivity;

                        v = Math.max(0, Math.min(MAX_LEVEL, next))
                    }

                    if (v != value) {
                        //this.sendValue(v);
                        //setValue(v)
                        //if (callbacks.sendCC) callbacks.sendCC(def.channel, def.cc, value);
                        send(v);
                    }
                }

                break;
        }
        //if ()
    };

    return <div id={def.id} className="ccslider" style={def.vertical ? verticalCCSliderStyle() : horizontalCCSliderStyle()}>
        <div className="widget slider"
            style={def.vertical ? verticalSliderStyle() : horizontalSliderStyle()}

            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}>

            <div className="fill" style={def.vertical ? verticalFillStyle(value, def.mode) : horizontalFillStyle(value, def.mode)}>

            </div>
        </div>
        <button type="button" style={{
            width: "100%",
            backgroundColor: "transparent",
            color: "white",
            fontSize: "1em",
            margin: ".3em",
            fontFamily: "monospace",
            border: "none",
            whiteSpace: "nowrap",
            userSelect: "none",
            pointerEvents: "none"
        }}>
            <div>{Math.round(value * 127)}</div>
            <div>{def.label}</div>
        </button>
    </div >
}
