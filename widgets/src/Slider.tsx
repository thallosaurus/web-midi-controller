import { CCSliderProperties, SliderMode } from "definitions";
import { WidgetProperties } from "./Parser.tsx";
import { useEffect, useRef, useState } from "react";

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
        width: "100%"
    }
}

const horizontalSliderStyle = () => {
    return {
        height: "100%"
    }
}

const verticalCCSliderStyle = () => {
    return {
        width: "100%"
    }
}

const horizontalCCSliderStyle = () => {
    return {
        height: "100%"
    }
}

//const horizontal

export function CCSlider({ def }: WidgetProperties<CCSliderProperties>) {
    const [value, setValue] = useState(0);

    const baseValue = useRef<number>(0);
    const baseX = useRef<number>(0);
    const baseY = useRef<number>(0);
    const activePointer = useRef<number | null>(null);

    const start = (e: PointerEvent) => {
        e.preventDefault();
        vibrate();
        const el = e.currentTarget as HTMLElement;

        activePointer.current = e.pointerId;
        el.setPointerCapture(e.pointerId);

        baseValue.current = value;

        this.state.baseY = e.clientY;
        this.state.baseX = e.clientX;

        update(e);
    };

    const move = (e: PointerEvent) => {
        if (e.pointerId !== activePointer.current) return;
        update(e);
    };

    const end = (e: PointerEvent) => {
        if (e.pointerId !== activePointer.current) return;

        const el = e.target as HTMLElement;
        el.releasePointerCapture(e.pointerId);
        activePointer.current = null;

        if (def.mode == "snapback") {
            reset();
        }
    };

    const reset = () => {
        setValue(def.default_value ?? 0);
        //this.eventbus!.updateCC(this.prop.channel, this.prop.cc, def.default_value ?? 0);
    };

    const update = (e: PointerEvent) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        //const y = rect.bottom - e.clientY;

        switch (def.mode) {
            case "snapback":
            case "absolute":
                {
                    let v;
                    if (!def.vertical) {
                        const n = rect.bottom - e.clientY;
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
                        const n = e.clientX - rect.left;
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
                        console.log(rect);
                        console.log(v);
                        //this.sendValue(v);
                    }
                }
                break;

            case "relative":
                {
                    let v;
                    if (!def.vertical) {
                        const n = baseY.current - e.clientY;
                        const sensitivity = MAX_LEVEL / (rect.height);
                        const next = baseValue.current + n * sensitivity;
                        //(options.vertical ? (rect.width) : (rect.height));
                        v = Math.floor(
                            Math.max(0, Math.min(MAX_LEVEL, next)),
                        );
                    } else {
                        const delta = e.clientX - baseX.current;
                        const sensitivity = MAX_LEVEL / rect.width;
                        const next = baseValue.current + delta * sensitivity;

                        v = Math.floor(
                            Math.max(0, Math.min(MAX_LEVEL, next)),
                        );
                    }

                    if (v != value) {
                        //this.sendValue(v);
                    }
                }

                break;
        }
        //if ()
    };


    useEffect(() => console.log(def.cc, def.label, def.mode, def.vertical));
    return <div className="ccslider" style={def.vertical ? verticalCCSliderStyle() : horizontalCCSliderStyle()}>
        <div className="slider" style={def.vertical ? verticalSliderStyle() : horizontalSliderStyle()}>
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
            {def.label}
        </button>
    </div >
}