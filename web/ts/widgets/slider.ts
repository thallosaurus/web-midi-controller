import { vibrate } from "@common/ui_utils";
import type { CCSliderProperties } from "@bindings/Widget";
import type { WidgetState } from "@core/overlay";
import { registerCCWidget, sendUpdateCCValue, unregisterCCWidget } from "@eventbus/client";
import "./css/slider.css";

const MAX_LEVEL = 127;

export interface CCSliderState extends WidgetState {
    id: string | null,
    value: number,
    active_pointer: number | null,
    baseValue: number,
    baseY: number,
    baseX: number
}

// Renders the slider markup
export const CCSlider = (container: HTMLDivElement, options: CCSliderProperties) => {
    const fill = document.createElement("div");
    fill.classList.add("fill", options.mode);

    const reset_button = document.createElement("button");

    const slider = document.createElement("div");
    slider.classList.add(
        "slider",
        options.vertical ? "vertical" : "horizontal",
    );
    slider.appendChild(fill);

    container.appendChild(slider);
    container.appendChild(reset_button);
    return container;
}

export const UnloadCCSliderScript = (options: CCSliderProperties, o: HTMLDivElement, state: CCSliderState) => {
    const slider = o.querySelector<HTMLDivElement>(".slider")!;
    slider.addEventListener("pointerdown", state.handlers.pointerdown);
    slider.addEventListener("pointermove", state.handlers.pointermove);
    slider.addEventListener("pointerup", state.handlers.pointerup);
    slider.addEventListener("pointercancel", state.handlers.pointercancel);
    //unregister_cc_widget(id, options.channel, options.cc);
    unregisterCCWidget(state.id!, options.channel, options.cc);
}

export const CCSliderScript = (options: CCSliderProperties, o: HTMLDivElement, state: CCSliderState) => {
    state.value = options.default_value ?? 0;
    state.active_pointer = null;
    state.baseValue = 0;
    state.baseY = 0;
    state.baseX = 0;

    const fill = o.querySelector<HTMLDivElement>("div.fill")!;
    const reset_button = o.querySelector<HTMLDivElement>("button")!;
    const slider = o.querySelector<HTMLDivElement>(".slider")!;

    reset_button.addEventListener("click", () => {
        reset();
    });

    const set_reset_label = () => {
        reset_button.innerText = (options.label ?? "CC" + options.cc) + ":\n" +
            state.value;
    };
    set_reset_label();

    const start = (e: PointerEvent) => {
        e.preventDefault();
        vibrate();
        const el = e.currentTarget as HTMLElement;

        state.active_pointer = e.pointerId;
        el.setPointerCapture(e.pointerId);

        state.baseValue = state.value;
        state.baseY = e.clientY;
        state.baseX = e.clientX;

        update(e);
    };

    const move = (e: PointerEvent) => {
        if (e.pointerId !== state.active_pointer) return;
        update(e);
    };

    const end = (e: PointerEvent) => {
        if (e.pointerId !== state.active_pointer) return;

        const el = e.target as HTMLElement;
        el.releasePointerCapture(e.pointerId);
        state.active_pointer = null;

        if (options.mode == "snapback") {
            reset();
        }
    };

    const update_value = (v: number) => {
        state.value = v;
        if (options.vertical) {
            fill.style.width = (state.value / MAX_LEVEL) * 100 + "%";
        } else {
            fill.style.height = (state.value / MAX_LEVEL) * 100 + "%";
        }
        set_reset_label();
    };

    const reset = () => {
        update_bus_value(options.default_value ?? 0);
    };

    const update_bus_value = (v: number) => {
        sendUpdateCCValue(options.channel, options.cc, v);

        // also update ui directly
        update_value(v);
    };

    const update = (e: PointerEvent) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        //const y = rect.bottom - e.clientY;

        switch (options.mode) {
            case "snapback":
            case "absolute":
                {
                    let v;
                    if (!options.vertical) {
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
                    if (v != state.value) {
                        //update_value(v);
                        console.log(rect);
                        console.log(v);
                        update_bus_value(v);
                    }
                }
                break;

            case "relative":
                {
                    let v;
                    if (!options.vertical) {
                        const n = state.baseY - e.clientY;
                        const sensitivity = MAX_LEVEL / (rect.height);
                        const next = state.baseValue + n * sensitivity;
                        //(options.vertical ? (rect.width) : (rect.height));
                        v = Math.floor(
                            Math.max(0, Math.min(MAX_LEVEL, next)),
                        );
                    } else {
                        const delta = e.clientX - state.baseX;
                        const sensitivity = MAX_LEVEL / rect.width;
                        const next = state.baseValue + delta * sensitivity;

                        v = Math.floor(
                            Math.max(0, Math.min(MAX_LEVEL, next)),
                        );
                    }

                    if (v != state.value) {
                        update_bus_value(v);
                    }
                }

                break;
        }
        //if ()
    };

    /*register_cc_widget(
        id,
        options.default_value ?? 0,
        options.channel,
        options.cc,
        update_value,
    );*/

    registerCCWidget(options.channel, options.cc, options.default_value ?? 0, update_value).then(id => {
        state.id = id
    });

    /*const slider = document.createElement("div");
    slider.classList.add(
        "slider",
        options.vertical ? "vertical" : "horizontal",
    );*/
    state.handlers.pointerdown = start;
    state.handlers.pointermove = move;
    state.handlers.pointerup = end;
    state.handlers.pointercancel = end;
    slider.addEventListener("pointerdown", state.handlers.pointerdown);
    slider.addEventListener("pointermove", state.handlers.pointermove);
    slider.addEventListener("pointerup", state.handlers.pointerup);
    slider.addEventListener("pointercancel", state.handlers.pointercancel);
}