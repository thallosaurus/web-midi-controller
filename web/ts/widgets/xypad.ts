import "./css/xypad.css"
import type { CCSliderProperties, XYPadProperties } from "@bindings/Widget";
import { WidgetLifecycle, WidgetStateHandlers } from "@core/lifecycle";
import { EventBusConsumer, registerCCConsumer } from "@eventbus/client";

const clamp = (v: number) => Math.min(1, Math.max(0, v));

class Axis implements EventBusConsumer {
    consumerId: string | null = null;
    //parent: XYPadLifecycle
    //touchHandle: HTMLDivElement

    constructor() {
        //this.parent = parent

    }
    updateValue(v: number): void {
        throw new Error("Method not implemented.");
    }
    sendValue(v: number): void {
        throw new Error("Method not implemented.");
    }
    value: number = 0
}

export interface XYPadState {
    activePointer: number | null
}

export class XYPadLifecycle extends WidgetLifecycle<XYPadProperties, XYPadState> {
    handlers: WidgetStateHandlers = {};

    target: HTMLDivElement
    touchHandler: HTMLDivElement


    x = new Axis()
    y = new Axis()

    constructor(container: HTMLDivElement, options: XYPadProperties) {
        super({
            activePointer: null
        }, options);

        this.target = document.createElement("div");
        this.target.classList.add(".target");
        container.appendChild(this.target);

        this.touchHandler = document.createElement("div");
        this.touchHandler.classList.add("touchhandler");
        container.appendChild(this.touchHandler);
    }

    updateFromEvent(event: PointerEvent) {
        const rect = this.target.getBoundingClientRect();

        const x = clamp((event.clientX - rect.left) / rect.width);
        const y = clamp((event.clientY - rect.top) / rect.height);

        // UI
        //handle.style.left = `${x * 100}%`;
        //handle.style.top = `${y * 100}%`;

        // LOGIK
        //onXY(x, y);
        console.log(x, y);
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