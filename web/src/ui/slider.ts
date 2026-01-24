import { vibrate } from "../main.ts";
import { CCEvent, bus } from "../events.ts";
import "./slider.css";

const MAX_LEVEL = 127;

export interface SliderOptions {
    label?: string;
    channel: number;
    cc: number;
    default_value?: number;
    mode: string
}

export const setup_slider = (
    container: HTMLDivElement,
    options: SliderOptions,
) => {
    let value = options.default_value ?? 0;
    let activePointer: number | null = null;
    let baseValue = 0;
    let baseY = 0;

    const fill = document.createElement("div");
    fill.classList.add("fill", options.mode);

    const reset_button = document.createElement("button");
    reset_button.addEventListener("click", () => {
        reset();
    })

    const set_reset_label = () => {
        reset_button.innerText = (options.label ?? "CC" + options.cc) + ":\n" + value;
    }
    set_reset_label();

    const start = (e: PointerEvent) => {
        e.preventDefault();
        vibrate();
        const el = e.currentTarget as HTMLElement;

        activePointer = e.pointerId;
        el.setPointerCapture(e.pointerId);

        baseValue = value;
        baseY = e.clientY;

        update(e);
    };

    const move = (e: PointerEvent) => {
        if (e.pointerId !== activePointer) return;
        update(e);
    };

    const end = (e: PointerEvent) => {
        if (e.pointerId !== activePointer) return;

        const el = e.currentTarget as HTMLElement;
        el.releasePointerCapture(e.pointerId);
        activePointer = null;

        if (options.mode == "snapback") {
            reset();
        }
    };

    const update_value = (v: number) => {
        value = v;
        fill.style.height = (value / MAX_LEVEL) * 100 + "%";
        set_reset_label();

        bus.dispatchEvent(
            new CCEvent(options.channel, value, options.cc),
        );
    };

    const reset = () => {
        update_value(options.default_value ?? 0);
    };

    const update = (e: PointerEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const y = rect.bottom - e.clientY;

        switch (options.mode) {
            case "absolute":
                {
                    const v = Math.floor(
                        Math.max(
                            0,
                            Math.min(MAX_LEVEL, (y / rect.height) * MAX_LEVEL),
                        ),
                    );

                    if (v != value) {
                        update_value(v);
                    }
                }
                break;

            case "snapback":
            case "relative":
                {
                    const deltaY = baseY - e.clientY;
                    const sensitivity = MAX_LEVEL / rect.height;

                    const next = baseValue + deltaY * sensitivity;
                    const v = Math.floor(
                        Math.max(0, Math.min(MAX_LEVEL, next)),
                    );

                    if (v != value) {
                        update_value(v);
                    }
                }

                break;
        }
        //if ()
    };

    const slider = document.createElement("div");
    slider.classList.add("slider");
    slider.addEventListener("pointerdown", start);
    slider.addEventListener("pointermove", move);
    slider.addEventListener("pointerup", end);
    slider.addEventListener("pointercancel", end);
    slider.appendChild(fill);
    
    //const container = document.createElement("div");
    container.appendChild(slider);
    container.appendChild(reset_button);
    //parent.appendChild(container);
};
