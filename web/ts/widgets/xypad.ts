import "./css/xypad.css"
import type { CCSliderProperties, XYPadProperties } from "@bindings/Widget";
import { WidgetLifecycle, WidgetStateHandlers } from "@core/lifecycle";
import { EventBusConsumer, registerCCConsumer, sendUpdateCCValue } from "@eventbus/client";

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

export class XYPadLifecycle extends WidgetLifecycle<XYPadProperties, XYPadState> {
    handlers: WidgetStateHandlers = {};

    target: HTMLDivElement
    label: HTMLDivElement
    //touchHandler: HTMLDivElement

    x: Axis
    y: Axis

    constructor(container: HTMLDivElement, options: XYPadProperties) {
        super({
            activePointer: null
        }, options);


        this.target = document.createElement("div");
        this.target.classList.add("target");
        container.appendChild(this.target);

        const touchHandler = document.createElement("div");
        touchHandler.classList.add("touchhandler");
        this.target.appendChild(touchHandler);

        this.label = document.createElement("div");
        this.label.classList.add("label")
        container.appendChild(this.label)

        this.x = new Axis(AxisDirection.X, options, touchHandler);
        this.y = new Axis(AxisDirection.Y, options, touchHandler);
    }

    updateLabel() {
        this.label.innerText = this.x.value + "/" + this.y.value
    }

    updateFromEvent(event: PointerEvent) {
        const rect = this.target.getBoundingClientRect();

        const x = clamp((event.clientX - rect.left) / rect.width) * 127;
        const y = clamp((event.clientY - rect.top) / rect.height) * 127;
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
        }

        this.handlers = {
            pointerdown: (e) => {
                if (this.state.activePointer !== null) return;
                this.state.activePointer = e.pointerId;
                const el = e.target as HTMLDivElement;
                el.setPointerCapture(this.state.activePointer);
                this.updateFromEvent(e);
            },
            pointermove: (e) => {
                if (e.pointerId !== this.state.activePointer) return;
                this.updateFromEvent(e);
            },
            pointerup: release_pointer,
            pointercancel: release_pointer
        }

        // register axises as cc values
        registerCCConsumer(this.x.prop.channel, this.x.prop.x.cc, null, this.x)
        registerCCConsumer(this.y.prop.channel, this.y.prop.y.cc, null, this.y)
        this.updateLabel();

        this.target.addEventListener("pointerdown", this.handlers.pointerdown);
        this.target.addEventListener("pointermove", this.handlers.pointermove);
        this.target.addEventListener("pointercancel", this.handlers.pointercancel);
        this.target.addEventListener("pointerup", this.handlers.pointerup);

        return false;

    }
    unload(options: XYPadProperties, html: HTMLDivElement): boolean {
        return false;
    }
    sendValue(v: number): void {
        throw new Error("Method not implemented.");
    }
    consumerId: string | null = null;
    updateValue(v: number): void {
        throw new Error("Method not implemented.");
    }
}