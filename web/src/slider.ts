import "./slider.css";

export const emitter = new EventTarget();

export class CCSliderEvent extends Event {
    midi_channel: number;
    value: number;
    cc: number;
    static event_name = "ccupdate";
    constructor(midi_channel: number, value: number, cc: number) {
        super(CCSliderEvent.event_name);
        this.midi_channel = midi_channel;
        this.value = value;
        this.cc = cc;
    }
}

const MAX_LEVEL = 127;

export interface SliderOptions {
    channel: number;
    cc: number;
    default_value?: number;
    mode: "absolute" | "relative" | "snapback";
}

export const setup_slider = (
    parent: HTMLDivElement,
    options: SliderOptions,
) => {
    let value = 0;
    let activePointer: number | null = null;
    let baseValue = 0;
    let baseY = 0;

    let fill = document.createElement("div");
    fill.classList.add("fill", options.mode);

    const start = (e: PointerEvent) => {
        e.preventDefault();
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
        value = v
        fill.style.height = (value / MAX_LEVEL) * 100 + "%";

        emitter.dispatchEvent(new CCSliderEvent(options.channel, value, options.cc))
    }

    const reset = () => {
        update_value(options.default_value ?? 0)
    }

    const update = (e: PointerEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const y = rect.bottom - e.clientY;

        switch (options.mode) {
            case "absolute":
                let abs_v = Math.floor(
                    Math.max(
                        0,
                        Math.min(MAX_LEVEL, (y / rect.height) * MAX_LEVEL),
                    ),
                );

                if (abs_v != value) {
                    update_value(abs_v)
                }
                break;

            case "snapback":
            case "relative":
                const deltaY = baseY - e.clientY;
                const sensitivity = MAX_LEVEL / rect.height;

                const next = baseValue + deltaY * sensitivity;
                let rel_v = Math.floor(Math.max(0, Math.min(MAX_LEVEL, next)));

                if (rel_v != value) {
                    update_value(rel_v);
                }

                break;
        }
        //if ()
    }

    let container = document.createElement("div");
    container.classList.add("slider");
    container.addEventListener("pointerdown", start);
    container.addEventListener("pointermove", move);
    container.addEventListener("pointerup", end);
    container.addEventListener("pointercancel", end);
    container.appendChild(fill);

    parent.appendChild(container);
};
