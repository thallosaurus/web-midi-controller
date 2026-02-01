import "./css/xypad.css"
import type { CCSliderProperties, XYPadProperties } from "@bindings/Widget";
import { WidgetLifecycle, WidgetStateHandlers } from "@core/lifecycle";
import { EventBusConsumer } from "@eventbus/client";

class XYAxis implements EventBusConsumer{
    value: number = 0
}

export interface XYPadState {
    x: XYAxis,
    y: XYAxis
}

export class XYPadLifecycle extends WidgetLifecycle<XYPadProperties, XYPadState> {
    state: XYPadState;
    prop: XYPadProperties;
    handlers: WidgetStateHandlers = {};
    load(options: XYPadProperties, html: HTMLDivElement): WidgetStateHandlers {
        throw new Error("Method not implemented.");
    }
    unload(options: XYPadProperties, html: HTMLDivElement): void {
        throw new Error("Method not implemented.");
    }
    constructor(container: HTMLDivElement, options: XYPadProperties) {
        super();
        this.state = {}
        this.prop = options
    }
    sendValue(v: number): void {
        throw new Error("Method not implemented.");
    }
    consumerId: string | null = null;
    updateValue(v: number): void {
        throw new Error("Method not implemented.");
    }
}