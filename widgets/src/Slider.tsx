import { CCSliderProperties, SliderMode } from "@hdj/definitions";
import { WidgetProperties } from "./Parser.tsx";
import { useEffect, useRef, useState } from "react";
import { vibrate } from "./utils.ts";

const MAX_LEVEL = 127;

const growFactor = (value) => {
    return (value / MAX_LEVEL) * 100 + "%";
}

const verticalFillStyle = (value, type: SliderMode) => {
    return { width: growFactor(value), borderRight: `1em solid var(--${type})`, height: "100%", left: 0 }
}

const horizontalFillStyle = (value, type: SliderMode) => {
    return { height: growFactor(value), borderTop: `1em solid var(--${type})`, width: "100%", bottom: 0 }
}

const verticalSliderStyle = () => {
    return {
        width: "100%",
    }
}

const horizontalSliderStyle = () => {
    return {
        height: "100%",
    }
}

const verticalCCSliderStyle = () => {
    return {
        width: "100%",
        alignItems: "center"
    }
}

const horizontalCCSliderStyle = () => {
    return {
        height: "100%",
        alignItems: "center"
    }
}

//const horizontal

export function CCSlider({ def, callbacks }: WidgetProperties<CCSliderProperties>) {
    const [value, setValue] = useState(0);

    const baseValue = useRef<number>(0);
    const baseX = useRef<number>(0);
    const baseY = useRef<number>(0);
    const activePointer = useRef<number | null>(null);

    useEffect(() => {
        const id = callbacks.registerCC(def.channel, def.cc, setValue)
        return () => {
            callbacks.unregisterCC(def.channel, def.cc, id)
        }
        //  callbacks.registerCC(def.channel, def.y.cc, (v) => setValueY)
    })

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

    const move = ({ target, clientY, clientX, pointerId }) => {
        if (pointerId !== activePointer.current) return;
        update({ target, clientY, clientX });
    };

    const end = ({ target, pointerId }) => {
        if (pointerId !== activePointer.current) return;

        const el = target as HTMLElement;
        el.releasePointerCapture(pointerId);
        activePointer.current = null;

        if (def.mode == "snapback") {
            reset();
        }
    };

    const reset = () => {
        setValue(def.default_value ?? 0);
        //this.eventbus!.updateCC(this.prop.channel, this.prop.cc, def.default_value ?? 0);
    };

    const update = ({ target, clientY, clientX }) => {
        const rect = (target as HTMLElement).getBoundingClientRect();

        switch (def.mode) {
            case "snapback":
            case "absolute":
                {
                    let v: number;
                    if (!def.vertical) {
                        const n = rect.bottom - clientY;
                        v = Math.floor(
                            Math.max(
                                0,
                                Math.min(
                                    MAX_LEVEL,
                                    (n / rect.height) * MAX_LEVEL,
                                ),
                            ),
                        );
                    } else {
                        const n = clientX - rect.left;
                        v = Math.floor(
                            Math.max(
                                0,
                                Math.min(
                                    (n / rect.width) * MAX_LEVEL,
                                    MAX_LEVEL,
                                ),
                            ),
                        );
                    }
                    if (v != value) {
                        //update_value(v);
                        //console.log(rect);
                        //console.log(v);
                        //this.sendValue(v);
                        setValue(v)
                        if (callbacks.sendCC) callbacks.sendCC(def.channel, def.cc, value);
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
                        v = Math.floor(
                            Math.max(0, Math.min(MAX_LEVEL, next)),
                        );
                    } else {
                        const delta = clientX - baseX.current;
                        const sensitivity = MAX_LEVEL / rect.width;
                        const next = baseValue.current + delta * sensitivity;

                        v = Math.floor(
                            Math.max(0, Math.min(MAX_LEVEL, next)),
                        );
                    }

                    if (v != value) {
                        //this.sendValue(v);
                        setValue(v)
                        if (callbacks.sendCC) callbacks.sendCC(def.channel, def.cc, value);
                    }
                }

                break;
        }
        //if ()
    };

    return <div id={def.id} className="ccslider" style={def.vertical ? verticalCCSliderStyle() : horizontalCCSliderStyle()}>
        <div className="slider"
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
            whiteSpace: "nowrap"
        }}>
            <div>{value}</div>
            <div>{def.label}</div>
        </button>
    </div >
}