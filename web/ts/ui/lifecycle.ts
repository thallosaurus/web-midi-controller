import { AllowedWidgetProperties } from "@bindings/Overlay"
import { WidgetProperties } from "./render"


/*export interface WidgetState {
    handlers: WidgetStateHandlers
}*/

type WidgetStateHandlersType = "pointerup" | "pointerdown" | "pointerend" | "pointercancel";

export interface WidgetStateHandlers {
    [key: string]: (e: PointerEvent) => void 
}

export abstract class WidgetLifecycle<O extends WidgetProperties, S> {
    // appends stuff to the widget before the widget itself

    abstract state: S
    abstract prop: O
    abstract handlers: WidgetStateHandlers
    constructor() { }
    abstract load(options: O, html: HTMLDivElement): void;
    abstract unload(options: O, html: HTMLDivElement): void;

    /*registerCCWidget(widget: CCWidgetConsumer) {
        registerCCWidgetOnBus(widget.channel, widget.cc, widget.default_value ?? 0, widget.updateValue).then(id => {
            widget.id = id
        });
    }
    
    unregisterCCWidget(widget: CCWidgetConsumer) {}
    */
    // Intantiates the correct object
}