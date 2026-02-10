import "./css/xypad.css"
import type { XYPadProperties } from "@bindings/Widget";
import { vibrate } from "@common/ui_utils";
import { WidgetLifecycle, WidgetStateHandlers } from "@core/lifecycle";
import { EventBusConsumer, registerCCConsumer, registerNoteConsumer, sendUpdateCCValue, sendUpdateNoteValue, unregisterCCConsumer, unregisterNoteConsumer } from "@eventbus/client";
import { App } from "../../app_state";

const clamp = (v: number) => Math.min(1, Math.max(0, v));

enum AxisDirection {
    X,
    Y
}

class Axis implements EventBusConsumer {
    consumerId: string | null = null;
    value: number = 0
    prop: XYPadProperties

    direction: AxisDirection
    touchHandle: HTMLDivElement

    constructor(direction: AxisDirection, prop: XYPadProperties, touchHandle: HTMLDivElement) {
        //this.parent = parent
        this.direction = direction
        this.prop = prop
        this.touchHandle = touchHandle
        this.updateValue(this.value);
    }
    updateValue(v: number): void {
        this.value = v;
    }
    sendValue(v: number): void {
        const vv = Math.floor(v);
        if (vv != this.value) {
            this.value = vv;
            switch (this.direction) {
                case AxisDirection.X:
                    this.touchHandle.style.setProperty("--xpos", String(vv));
                    sendUpdateCCValue(this.prop.channel, this.prop.x.cc, vv)
                    break;

                case AxisDirection.Y:
                    this.touchHandle.style.setProperty("--ypos", String(vv));
                    sendUpdateCCValue(this.prop.channel, this.prop.y.cc, vv);
                    break;
            }
        }
    }
}

export interface XYPadState {
    activePointer: number | null
}

export class XYPadLifecycle extends WidgetLifecycle<XYPadProperties, XYPadState> implements EventBusConsumer {
    handlers: WidgetStateHandlers = {};

    target: HTMLDivElement
    x_label: HTMLButtonElement
    y_label: HTMLButtonElement
    //touchHandler: HTMLDivElement

    x: Axis
    y: Axis

    constructor(container: HTMLDivElement, options: XYPadProperties) {
        super({
            activePointer: null
        }, options);

        this.y_label = document.createElement("button");
        this.y_label.classList.add("label", "y-label")
        container.appendChild(this.y_label)

        this.target = document.createElement("div");
        this.target.classList.add("target");
        container.appendChild(this.target);

        const touchHandler = document.createElement("div");
        touchHandler.classList.add("touchhandler");
        this.target.appendChild(touchHandler);

        this.x_label = document.createElement("button");
        this.x_label.classList.add("label", "x-label")
        container.appendChild(this.x_label)

        this.target.innerText = this.prop.label ?? "XY Pad"

        this.x = new Axis(AxisDirection.X, options, touchHandler);
        this.y = new Axis(AxisDirection.Y, options, touchHandler);
    }

    updateLabel() {
        this.x_label.innerText = this.x.value + " - tap to assign"
        this.y_label.innerText = this.y.value + " - tap to assign"
    }

    updateFromEvent(event: PointerEvent) {
        const rect = this.target.getBoundingClientRect();

        const left = (event.clientX - rect.left)
        const x = clamp(left / rect.width) * 127;

        const bottom = event.clientY - rect.top
        const y = (1 - clamp((bottom) / rect.height)) * 127;
        this.x.sendValue(x);
        this.y.sendValue(y);

        this.updateLabel();
    }

    load(options: XYPadProperties, html: HTMLDivElement) {
        const release_pointer = (e: PointerEvent) => {
            if (e.pointerId !== this.state.activePointer) return;
            const el = e.target as HTMLDivElement;
            el.releasePointerCapture(e.pointerId);
            this.updateFromEvent(e);
            this.state.activePointer = null;
            this.target.classList.remove("pressed");
            this.sendValue(0)
        }

        this.handlers = {
            pointerdown: (e) => {
                if (this.state.activePointer !== null) return;
                vibrate();
                this.state.activePointer = e.pointerId;
                const el = e.target as HTMLDivElement;
                el.setPointerCapture(this.state.activePointer);
                this.updateFromEvent(e);

                this.target.classList.add("pressed");
                
                this.sendValue(this.prop.velocity ?? 127)
            },
            pointermove: (e) => {
                if (e.pointerId !== this.state.activePointer) return;
                this.updateFromEvent(e);
            },
            pointerup: release_pointer,
            pointercancel: release_pointer,

            xlabel_pointerup: (e) => {
                sendUpdateCCValue(this.prop.channel, this.prop.x.cc, this.x.value)
                //this.x.sendValue(this.x.value);
            },
            ylabel_pointerup: (e) => {
                sendUpdateCCValue(this.prop.channel, this.prop.y.cc, this.y.value)
                //this.y.sendValue(this.y.value);
            }
        }

        // register axises as cc values
        App.eventbus.registerCC(this.x.prop.channel, this.x.prop.x.cc, 0, this.x).then(id => {
            this.x.consumerId = id
        })
        App.eventbus.registerCC(this.y.prop.channel, this.y.prop.y.cc, 0, this.y).then(id => {
            this.y.consumerId = id;
        })

        if (this.prop.note) {
            App.eventbus.registerNote(this.prop.channel, this.prop.note, this).then(id=> {
                this.consumerId = id;
            });
        }
        this.updateLabel();

        this.target.addEventListener("pointerdown", this.handlers.pointerdown);
        this.target.addEventListener("pointermove", this.handlers.pointermove);
        this.target.addEventListener("pointercancel", this.handlers.pointercancel);
        this.target.addEventListener("pointerup", this.handlers.pointerup);

        this.x_label.addEventListener("pointerdown", this.handlers.xlabel_pointerup);
        this.y_label.addEventListener("pointerdown", this.handlers.ylabel_pointerup);
        
        return false;
        
    }
    unload(options: XYPadProperties, html: HTMLDivElement): boolean {

        App.eventbus.unregisterCC(this.consumerId!, this.x.prop.channel, this.x.prop.x.cc);
        App.eventbus.unregisterCC(this.consumerId!, this.y.prop.channel, this.y.prop.y.cc);
        if (this.prop.note) {
            App.eventbus.unregisterCC(this.consumerId!, this.prop.channel, this.prop.note);
        }
        
        this.target.removeEventListener("pointerdown", this.handlers.pointerdown);
        this.target.removeEventListener("pointermove", this.handlers.pointermove);
        this.target.removeEventListener("pointercancel", this.handlers.pointercancel);
        this.target.removeEventListener("pointerup", this.handlers.pointerup);
        this.x_label.removeEventListener("pointerdown", this.handlers.xlabel_pointerup);
        this.y_label.removeEventListener("pointerdown", this.handlers.ylabel_pointerup);
        return false;
    }
    sendValue(v: number): void {
        if (this.prop.note) {
            sendUpdateNoteValue(this.prop.channel, this.prop.note, v, v > 0, false)
        }
    }
    consumerId: string | null = null;
    updateValue(v: number): void {
        // what we received 
    }
}