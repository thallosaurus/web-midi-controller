import "./css/xypad.css"
import type { CCSliderProperties, XYPadProperties } from "@bindings/Widget";
import { WidgetLifecycle, WidgetStateHandlers } from "@core/lifecycle";
import { EventBusConsumer } from "@eventbus/client";

class Axis implements EventBusConsumer {
    consumerId: string | null = null;
    updateValue(v: number): void {
        throw new Error("Method not implemented.");
    }
    sendValue(v: number): void {
        throw new Error("Method not implemented.");
    }
    value: number = 0
}

export interface XYPadState {
    x: Axis,
    y: Axis
}

export class XYPadLifecycle extends WidgetLifecycle<XYPadProperties, XYPadState> {
    handlers: WidgetStateHandlers = {};

    constructor(container: HTMLDivElement, options: XYPadProperties) {
        super({
            x: new Axis(),
            y: new Axis(),
        }, options);
    }
    
    load(options: XYPadProperties, html: HTMLDivElement): WidgetStateHandlers {
        throw new Error("Method not implemented.");
    }
    unload(options: XYPadProperties, html: HTMLDivElement): void {
        throw new Error("Method not implemented.");
    }
    sendValue(v: number): void {
        throw new Error("Method not implemented.");
    }
    consumerId: string | null = null;
    updateValue(v: number): void {
        throw new Error("Method not implemented.");
    }
}