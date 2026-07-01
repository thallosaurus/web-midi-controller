import { GridMixerProperties, HorizontalMixerProperties, ShiftAreaProperties, VerticalMixerProperties } from "../../bindings/Widget";
import { WidgetLifecycle } from "./lifecycle";
import { render_widget, WidgetProperties } from "./render";
import { LoadedWidget } from "./overlay";

import './css/shiftarea.css';
import './css/layout.css';
import { EventBusConsumer, EventbusWorkerClient } from "../eventbus/client";
import { App } from "../../app";

class Layout<Prop extends WidgetProperties, State> extends WidgetLifecycle<Prop, State> {
    processEditMode(data: Event): void {
        throw new Error("Method not implemented.");
    }
    constructor(state: State, options: Prop, eb: EventbusWorkerClient) {
        super(state, options, eb)
    }
}

interface EmptyLayoutState { }

export class GridMixerNew extends Layout<GridMixerProperties, EmptyLayoutState> {
    processEditMode(data: Event): void {
        throw new Error("Method not implemented.");
    }
    constructor(container: HTMLDivElement, options: GridMixerProperties, children: Array<LoadedWidget>, eb: EventbusWorkerClient) {
        super({}, options, eb);
        if (options.id) container.id = options.id;
        container.style.setProperty("--cols", String(options.w));
        container.style.setProperty("--rows", String(options.h));

        for (const child of options.grid) {
            let ww = render_widget(child, children, eb);
            container.appendChild(ww.html);
            children.push(ww);
        }
    }
}

export class HorizontalBox extends Layout<HorizontalMixerProperties, EmptyLayoutState> {
    processEditMode(data: Event): void {
        throw new Error("Method not implemented.");
    }
    constructor(container: HTMLDivElement, options: HorizontalMixerProperties, children: Array<LoadedWidget>, eb: EventbusWorkerClient) {
        super({}, options, eb);
        if (options.id) container.id = options.id;

        for (const child of options.horiz) {
            const ww = render_widget(child, children, eb);
            container.appendChild(ww.html);
            children.push(ww);
        }
    }
}

export class VerticalBox extends Layout<VerticalMixerProperties, EmptyLayoutState> {
    processEditMode(data: Event): void {
        throw new Error("Method not implemented.");
    }
    constructor(container: HTMLDivElement, options: VerticalMixerProperties, children: Array<LoadedWidget>, eb: EventbusWorkerClient) {
        super({}, options, eb);
        if (options.id) container.id = options.id;

        for (const child of options.vert) {
            const ww = render_widget(child, children, eb);
            container.appendChild(ww.html);
            children.push(ww);
        }
    }
}

enum ShiftState {
    A,
    B
}

interface ShiftAreaState extends EmptyLayoutState {
    shift: ShiftState
}

export class ShiftArea extends Layout<ShiftAreaProperties, ShiftAreaState> implements EventBusConsumer {
    processEditMode(data: Event): void {
        throw new Error("Method not implemented.");
    }
    //areaA: HTMLDivElement;
    //areaB: HTMLDivElement;

    container: HTMLDivElement
    consumerId: string | null = null;
    
    constructor(container: HTMLDivElement, options: ShiftAreaProperties, children: Array<LoadedWidget>, eb: EventbusWorkerClient) {
        super({
            shift: ShiftState.A
        }, options, eb);

        this.container = container;
        
        if (options.id) this.container.id = options.id;

        const panel_a = document.createElement("div");
        panel_a.classList.add("panel", "a");
        for (const child of options.a) {
            const ww = render_widget(child, children, eb);
            panel_a.appendChild(ww.html);
            children.push(ww);
        }
        this.container.appendChild(panel_a);

        const panel_b = document.createElement("div");
        panel_b.classList.add("panel", "b");
        for (const child of options.b) {
            const ww = render_widget(child, children, eb);
            panel_b.appendChild(ww.html);
            children.push(ww);
        }
        this.container.appendChild(panel_b);
        App.eventbus.registerNote(this.prop.channel, this.prop.note, this).then(id => {
            this.consumerId = id
        })
        this.updateUi();
    }
    
    updateValue(v: number): void {
        if (v > 64) {
            this.state.shift = ShiftState.B;
        } else {
            this.state.shift = ShiftState.A;
        }
        this.updateUi();
    }
    sendValue(v: number): void {
        throw new Error("Method not implemented.");
    }

    updateUi() {
        switch (this.state.shift) {
            case ShiftState.A:
                this.container.dataset.alternate = String(false);
                break;
                
            case ShiftState.B:
                this.container.dataset.alternate = String(true);
                break;
        }
    }
}