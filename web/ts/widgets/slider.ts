import { vibrate } from "@common/ui_utils";
import type { CCSliderProperties } from "@bindings/Widget";
import { WidgetLifecycle, WidgetStateHandlers } from "@core/lifecycle";
import { EventBusConsumer, registerCCConsumer, sendUpdateCCValue, unregisterCCWidget } from "@eventbus/client";
import "./css/slider.css";

const MAX_LEVEL = 127;

export interface CCSliderState {
    //id: string | null,
    value: number,
    active_pointer: number | null,
    baseValue: number,
    baseY: number,
    baseX: number
}

export class CCSliderLifecycle extends WidgetLifecycle<CCSliderProperties, CCSliderState> implements EventBusConsumer {
    /**
     * The Properties as read from the file
     */
    prop: CCSliderProperties;
    /**
     * the state of the widget
     */
    state: CCSliderState;

    handlers: WidgetStateHandlers = {};/* = {
        pointerdown: start;
        pointermove: move;
        pointerup: end;
        pointercancel: end;
    };*/

    resetButton: HTMLButtonElement
    fill: HTMLDivElement
    slider: HTMLDivElement

    /**
     * The id assigned by the event bus
     */
    consumerId: string | null = null;

    constructor(container: HTMLDivElement, options: CCSliderProperties) {
        super();
        this.state = {
            value: options.default_value ?? 0,
            active_pointer: null,
            baseValue: 0,
            baseX: 0,
            baseY: 0,
            //handlers: {}
        };

        this.prop = options

        /*this.state.value = options.default_value ?? 0;
        this.state.active_pointer = null;
        this.state.baseValue = 0;
        this.state.baseY = 0;
        this.state.baseX = 0;*/
        this.fill = document.createElement("div");
        this.fill.classList.add("fill", options.mode);

        this.resetButton = document.createElement("button");

        this.slider = document.createElement("div");
        this.slider.classList.add(
            "slider",
            options.vertical ? "vertical" : "horizontal",
        );
        this.slider.appendChild(this.fill);

        container.appendChild(this.slider);
        container.appendChild(this.resetButton);
    }

    updateValue(v: number): void {
        //const fill = document.createElement("div");
        this.state.value = v;
        if (this.prop.vertical) {
            this.fill.style.width = (this.state.value / MAX_LEVEL) * 100 + "%";
        } else {
            this.fill.style.height = (this.state.value / MAX_LEVEL) * 100 + "%";
        }
        //set_reset_label();
        this.setResetLabel();
    }

    setResetLabel() {

        this.resetButton.innerText = (this.prop.label ?? "CC" + this.prop.cc) + ":\n" +
            this.state.value;

    }
    load(options: CCSliderProperties, html: HTMLDivElement) {
        this.resetButton.addEventListener("click", () => {
            reset();
        });

        this.setResetLabel();

        const start = (e: PointerEvent) => {
            e.preventDefault();
            vibrate();
            const el = e.currentTarget as HTMLElement;

            this.state.active_pointer = e.pointerId;
            el.setPointerCapture(e.pointerId);

            this.state.baseValue = this.state.value;
            this.state.baseY = e.clientY;
            this.state.baseX = e.clientX;

            update(e);
        };

        const move = (e: PointerEvent) => {
            if (e.pointerId !== this.state.active_pointer) return;
            update(e);
        };

        const end = (e: PointerEvent) => {
            if (e.pointerId !== this.state.active_pointer) return;

            const el = e.target as HTMLElement;
            el.releasePointerCapture(e.pointerId);
            this.state.active_pointer = null;

            if (options.mode == "snapback") {
                reset();
            }
        };

        const reset = () => {
            this.updateValue(options.default_value ?? 0);
            //update_bus_value(options.default_value ?? 0);
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
                        if (v != this.state.value) {
                            //update_value(v);
                            console.log(rect);
                            console.log(v);
                            this.sendValue(v);
                        }
                    }
                    break;

                case "relative":
                    {
                        let v;
                        if (!options.vertical) {
                            const n = this.state.baseY - e.clientY;
                            const sensitivity = MAX_LEVEL / (rect.height);
                            const next = this.state.baseValue + n * sensitivity;
                            //(options.vertical ? (rect.width) : (rect.height));
                            v = Math.floor(
                                Math.max(0, Math.min(MAX_LEVEL, next)),
                            );
                        } else {
                            const delta = e.clientX - this.state.baseX;
                            const sensitivity = MAX_LEVEL / rect.width;
                            const next = this.state.baseValue + delta * sensitivity;

                            v = Math.floor(
                                Math.max(0, Math.min(MAX_LEVEL, next)),
                            );
                        }

                        if (v != this.state.value) {
                            this.sendValue(v);
                        }
                    }

                    break;
            }
            //if ()
        };
        this.handlers.pointerdown = start;
        this.handlers.pointermove = move;
        this.handlers.pointerup = end;
        this.handlers.pointercancel = end;

        /*registerCCWidgetOnBus(options.channel, options.cc, options.default_value ?? 0, update_value).then(id => {
            //state.id = id
            this.consumerId = id;
        });*/
        
        /*const slider = document.createElement("div");
        slider.classList.add(
            "slider",
            options.vertical ? "vertical" : "horizontal",
            );*/

            
        registerCCConsumer(options, this);

        /*
        slider.addEventListener("pointerdown", state.handlers.pointerdown);
        slider.addEventListener("pointermove", state.handlers.pointermove);
        slider.addEventListener("pointerup", state.handlers.pointerup);
        slider.addEventListener("pointercancel", state.handlers.pointercancel);*/
    }
    unload(options: CCSliderProperties, html: HTMLDivElement): void {
        const slider = html.querySelector<HTMLDivElement>(".slider")!;
        slider.addEventListener("pointerdown", this.handlers.pointerdown);
        slider.addEventListener("pointermove", this.handlers.pointermove);
        slider.addEventListener("pointerup", this.handlers.pointerup);
        slider.addEventListener("pointercancel", this.handlers.pointercancel);
    }

    sendValue(v: number) {
        sendUpdateCCValue(this.prop.channel, this.prop.cc, v);

        // update ui - TODO gate behind feature gate
        this.updateValue(v);
    }
}