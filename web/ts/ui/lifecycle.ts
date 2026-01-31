import { WidgetProperties } from "./render"

export interface WidgetState {
    handlers: WidgetStateHandlers
}

export interface WidgetStateHandlers {
    [key: string]: (e: PointerEvent) => void
}



export abstract class WidgetLifecycle<O extends WidgetProperties, S extends WidgetState> {
    // appends stuff to the widget before the widget itself
    constructor() { }
    abstract load(options: O, html: HTMLDivElement, state: S): void
    abstract unload(options: O, html: HTMLDivElement, state: WidgetState): void;

    // Intantiates the correct object
}