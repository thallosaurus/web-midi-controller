import { vibrate } from "@common/ui_utils";
import "./css/button.css";
import { type CCButtonProperties, type NoteButtonProperties } from '@bindings/Widget';
import { WidgetLifecycle, WidgetStateHandlers } from "@core/lifecycle";

import { EventBusConsumer } from "@eventbus/client";
import { App } from "../../app_state";


/**
 * Holds the handlers the UI calls when an event occurs
 */
export interface ButtonState {
    //id: string | null
    latch_on: boolean,
    active_pointer: number | null,
}

export class NoteButtonLifecycle extends WidgetLifecycle<NoteButtonProperties, ButtonState> implements EventBusConsumer {
    handlers: WidgetStateHandlers = {};
    consumerId: string | null = null;

    target: HTMLDivElement

    constructor(container: HTMLDivElement, options: NoteButtonProperties) {
        super({
            latch_on: false,
            active_pointer: null
        }, options);

        this.target = document.createElement("div");
        this.target.classList.add("target");
        container.appendChild(this.target);
        //NoteButton(container, options);
    }
    sendValue(v: number): void {
        throw new Error("Method not implemented.");
    }
    updateValue(n: number): void {
        console.log(this);
        this.state.latch_on = n > 0;
        this.setLabel();
        if (this.state.latch_on) {
            //latch_on = true;
            this.target.classList.add("press");
        } else {
            //latch_on = false;
            this.target.classList.remove("press");
        }
    }
    setLabel() {
        this.target.innerText = (this.prop.label ?? "NOTE " + this.prop.note) + ":\n" + (this.state.latch_on ? "On" : "Off")
    }
    load(options: NoteButtonProperties, html: HTMLDivElement) {
        const touch_start = (e: PointerEvent) => {
            e.preventDefault();
            vibrate();
            const el = e.currentTarget as HTMLElement;
            this.state.active_pointer = e.pointerId;
            el.setPointerCapture(e.pointerId);

            if (options.mode == "trigger") {
                this.state.latch_on = true;
                touch_update();
            }

        };

        const touch_end = (e: PointerEvent) => {
            if (e.pointerId !== this.state.active_pointer) return;

            const el = e.currentTarget as HTMLElement;
            el.releasePointerCapture(e.pointerId);
            this.state.active_pointer = null;

            el.classList.remove("press");

            if (options.mode == "trigger") {
                this.state.latch_on = false;
            } else if (options.mode == "latch") {
                this.state.latch_on = !this.state.latch_on;
            }
            touch_update();
        };

        const touch_update = () => {
            this.sendUpdate(this.state.latch_on ? 127 : 0)
        };

        App.eventbus.registerNote(this.prop.channel, this.prop.note, this)
            .then(id => {
                this.consumerId = id;
            });

        if (options.mode != "readonly") {

            this.handlers.pointerdown = touch_start;
            this.handlers.pointerup = touch_end;
            this.handlers.pointercancel = touch_end;
        }
        this.setLabel();

        return true;
    }
    unload(options: NoteButtonProperties, html: HTMLDivElement): boolean {
        /*if (options.mode != "readonly") {

            const button = html.querySelector<HTMLDivElement>(".target")!;
            button.removeEventListener("pointerdown", this.handlers.pointerdown)
            button.removeEventListener("pointerup", this.handlers.pointerup)
            button.removeEventListener("pointercancel", this.handlers.pointercancel)
        }*/
        //unregister_midi_widget(id, options.channel, options.note);
        App.eventbus.unregisterNote(this.consumerId!, options.channel, options.note).then(id => {
            //state.id
            this.consumerId = null
        });
        return true;
    }

    sendUpdate(v: number) {
        App.eventbus.updateNote(this.prop.channel, this.prop.note, v);

        // also update ui directly
        if (import.meta.env.VITE_SELF_UPDATE_WIDGETS == "true") {
            console.warn("self updating note button")
            //update_value(v);
        }
    }
}

export class CCButtonLifecycle extends WidgetLifecycle<CCButtonProperties, ButtonState> implements EventBusConsumer {
    button: HTMLDivElement;

    constructor(container: HTMLDivElement, options: CCButtonProperties) {
        super({
            latch_on: false,
            active_pointer: null,
        }, options);

        //CCButton(container, options);
        this.button = document.createElement("div");
        this.button.classList.add("target");
        container.appendChild(this.button);

        //return container;
    }
    consumerId: string | null = null;
    updateValue(v: number): void {
        this.state.latch_on = v > 0;
        this.setLabel();
        if (this.state.latch_on) {
            //latch_on = true;
            this.button.classList.add("press");
        } else {
            //latch_on = false;
            this.button.classList.remove("press");
        }
    }
    setLabel() {
        this.button.innerText = (this.prop.label ?? "CC" + this.prop.cc) + ":\n" +
            (this.state.latch_on ? this.prop.value : this.prop.value_off);
    }
    load(options: CCButtonProperties, html: HTMLDivElement) {
        // Update State on the Bus
        /*const update_bus_value = (v: number) => {
            //process_internal(new CCEvent(options.channel, v, options.cc));

            sendUpdateCCValue(options.channel, options.cc, this.state.latch_on ? (options.value ?? 127) : (options.value_off ?? 0));
            /*if (import.meta.env.VITE_SELF_UPDATE_WIDGETS == "true") {
                // also update ui directly
                update_value(v);
            }*
        };*/

        // called, when the touch begins
        const touch_start = (e: PointerEvent) => {
            e.preventDefault();
            vibrate();
            const el = e.currentTarget as HTMLElement;
            this.state.active_pointer = e.pointerId;
            el.setPointerCapture(e.pointerId);

            if (options.mode == "trigger") {
                this.state.latch_on = true;
                touch_update();
            }
        };

        const touch_end = (e: PointerEvent) => {
            if (e.pointerId !== this.state.active_pointer) return;

            const el = e.currentTarget as HTMLElement;
            el.releasePointerCapture(e.pointerId);
            this.state.active_pointer = null;

            el.classList.remove("press");

            if (options.mode == "trigger") {
                this.state.latch_on = false;
            } else if (options.mode == "latch") {
                this.state.latch_on = !this.state.latch_on;
            }

            touch_update();
        };
        const touch_update = () => {
            console.log(this.state.latch_on);
            if (this.state.latch_on) {
                this.sendValue(options.value ?? 127);
            } else {
                this.sendValue(options.value_off ?? 0);
            }
        };

        //register_cc_widget(id, options.value_off ?? 0, options.channel, options.cc, update_value);
        /*registerCCWidgetOnBus(options.channel, options.cc, options.value_off ?? 0, update_value).then(id => {
            state.id = id
            this.consumerId = id
        });*/

        App.eventbus.registerCC(this.prop.channel, this.prop.cc, this.prop.default_value ?? 0, this).then(id => {
            this.consumerId = id
        })

        if (options.mode != "readonly") {
            this.handlers.pointerdown = touch_start;
            this.handlers.pointerup = touch_end;
            this.handlers.pointercancel = touch_end;
            //button.addEventListener("pointermove", move);
        }
        this.setLabel();

        return true;
    }
    unload(options: CCButtonProperties, html: HTMLDivElement): boolean {
        /*if (options.mode != "readonly") {

            // TODO Check if the correct target is handled here
            //const button = html.querySelector<HTMLDivElement>(".target")!;
            html.removeEventListener("pointerdown", this.handlers.pointerdown)
            html.removeEventListener("pointerup", this.handlers.pointerup)
            html.removeEventListener("pointercancel", this.handlers.pointercancel)
        }*/
        //unregister_cc_widget(id, options.channel, options.cc)
        App.eventbus.unregisterCC(this.consumerId!, this.prop.channel, this.prop.cc);
        /*        unregisterCCWidget(state.id!, options.channel, options.cc).then(id => {
                    state.id = null
                })*/
        return true;
    }

    sendValue(v: number): void {
        App.eventbus.updateCC(this.prop.channel, this.prop.cc, this.state.latch_on ? (this.prop.value ?? 127) : (this.prop.value_off ?? 0));
    }
}