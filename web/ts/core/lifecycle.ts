import { EventbusWorkerClient } from "../eventbus/client";
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

    state: S
    prop: O
    handlers: WidgetStateHandlers = {}
    eventbus: EventbusWorkerClient | null

    private static editMode = false;
    static uiEvents = new EventTarget();

    constructor(s: S, p: O, eb: EventbusWorkerClient) { 
        this.prop = p;

        this.state = s
        this.eventbus = eb;
    }
    /**
     * loads this lifecycle
     * return true if you want the ui to initialize the touch events for you
     * @param options 
     * @param html 
     * @returns 
     */
    load(options: O, html: HTMLDivElement): boolean {
        WidgetLifecycle.uiEvents.addEventListener("edit", this.processEditMode)
        return false;
    }

    /**
     * unloads this lifecycle
     * return true if you want the ui to remove the touch events for you
     * @param options 
     * @param html 
     * @returns 
     */
    unload(options: O, html: HTMLDivElement): boolean {
        WidgetLifecycle.uiEvents.removeEventListener("edit", this.processEditMode)
        return false;
    }

    abstract processEditMode(data: Event): void;

    static setEditMode(v: boolean) {
        this.editMode = v;

        this.uiEvents.dispatchEvent(new CustomEvent("edit", { detail: { edit: this.editMode } } ) )
    }

    /*registerCCWidget(widget: CCWidgetConsumer) {
        registerCCWidgetOnBus(widget.channel, widget.cc, widget.default_value ?? 0, widget.updateValue).then(id => {
            widget.id = id
        });
    }
    
    unregisterCCWidget(widget: CCWidgetConsumer) {}
    */
    // Intantiates the correct object
}