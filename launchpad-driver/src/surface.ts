import { MidiMessage } from "@driver";
import { Launchpad } from "./launchpad.ts";
import { BUTTON_DEF, ControlButtons } from "./controls.ts";
import { mkdtempSync } from "node:fs";
import { MidiDriver } from "@driver-deno";
import { threadId } from "node:worker_threads";

export enum LightMode {
    Normal = 1,
    Flashing = 2,
    Pulsing = 3
}

export interface Pixel {
    color: number,
    lightMode: LightMode,
    //    onTap?: (msg: MidiMessage) => void
}

export function LaunchpadProMap() {
    return Array.from([
        81, 82, 83, 84, 85, 86, 87, 88,
        71, 72, 73, 74, 75, 76, 77, 78,
        61, 62, 63, 64, 65, 66, 67, 68,
        51, 52, 53, 54, 55, 56, 57, 58,
        41, 42, 43, 44, 45, 46, 47, 48,
        31, 32, 33, 34, 35, 36, 37, 38,
        21, 22, 23, 24, 25, 26, 27, 28,
        11, 12, 13, 14, 15, 16, 17, 18
    ])
}

class MatrixManager {
    public pixels;

    private _state;

    constructor() {
        this.pixels = new Map<number, Pixel>(LaunchpadProMap().map((v) => {
            return [v, {
                "color": 0,
                "lightMode": LightMode.Normal
            }]
        }))

        this._state = new Map<number, number>(LaunchpadProMap().map((v, i) => {
            return [v, 0]
        }))
    }

    public get renderState() {
        return Array.from(LaunchpadProMap().map((note) => {
            const pixel = this.pixels.get(note)?.color ?? 0;
            return [note, pixel]
        }))
    }

    setXYColor(x: number, y: number, pixel: Pixel) {
        const i = (y * 8) + x;
        if (i >= 0 && i < 64) {
            this.setIColor(i, pixel);
        } else return;
    }

    setIColor(i: number, pixel: Pixel) {
        //console.debug("setting", i, "to", pixel)
        this.pixels.set(LaunchpadProMap().at(i)!, pixel);
        //console.debug(this.pixels);
        //const note = Surface.LAUNCHPAD_PROGRAMMER_MAP[i];
    }

    setPattern(data: number[]) {
        for (let i = 0; i < 64; i++) {
            const b = data.at(i);
            if (b) {
                //const color = this.active ? 66 : b;
                this.setIColor(i, {
                    "color": b,
                    "lightMode": LightMode.Normal
                })
            }
        }
    }

    processValue(note: number, velocity: number) {
        //const p = this.pixels.get(note);
        this._state.set(note, velocity);
        //console.log("processValue", this._state)
        //p?.
        //this.pixels.set(note, velocity);
    }

    clear() {
        this.pixels.clear();
        //this.pixelsCallback.delete();
    }

    /*getStateI(i: number) {
        //console.log("i", i)
        const p = this.pixels.get(i);
        console.log(this.pixels, p, i);
        return p;
    }*/

    //load()
}

export abstract class Surface {
    /*static LAUNCHPAD_PROGRAMMER_MAP = [
        81, 82, 83, 84, 85, 86, 87, 88,
        71, 72, 73, 74, 75, 76, 77, 78,
        61, 62, 63, 64, 65, 66, 67, 68,
        51, 52, 53, 54, 55, 56, 57, 58,
        41, 42, 43, 44, 45, 46, 47, 48,
        31, 32, 33, 34, 35, 36, 37, 38,
        21, 22, 23, 24, 25, 26, 27, 28,
        11, 12, 13, 14, 15, 16, 17, 18
    ];*/

    public events = new EventTarget();

    /*private colorState = new Map<number, number>(LaunchpadProMap().map((v, i) => {
        return [v, 0]
        }));*/
    //private pixels = new Map<number, Pixel>();
    //private pixelsCallback = new Map<number, (pressed: boolean, msg: MidiMessage) => void>();
    public controlButtons = new ControlButtons();
    public matrixManager = new MatrixManager();

    controlMapping = new Map<number, (pressed: boolean, cc: number) => void>()
    matrixMapping = new Map<number, (pressed: boolean, note: number, velocity: number) => void>()

    public renderState() {
        return {
            matrix: this.matrixManager.renderState,
            controls: this.controlButtons.renderState
        }
    }

    redraw: (() => void) | null = null
    //    private controlpixels = new Map<BUTTON_DEF, Pixel>();

    /*    public controlpixelsActions = new Map<number, (msg: MidiMessage) => void>();*/
    //protected caller: Launchpad;

    constructor() {
        //this.caller = caller;

        this.events.addEventListener("controls", (ev) => {
            const evt = ev as CustomEvent;
            const b = this.controlMapping.get(evt.detail.cc);
            if (b) b(evt.detail.state > 64, evt.detail.cc);
            if (this.redraw) this.redraw();
        })

        this.events.addEventListener("matrix", (ev) => {
            const evt = ev as CustomEvent;
            const b = this.matrixMapping.get(evt.detail.note);
            if (b) b(evt.detail.pressed, evt.detail.note, evt.detail.velocity)
            if (this.redraw) this.redraw();
        })
    }

    /**
     * Gets typically set by Launchpad Class
     * @param cb 
     */
    setRedraw(cb: () => void) {
        this.redraw = cb;
    }

    setMatrixMappingXY(x: number, y: number, cb: (pressed: boolean, note: number, velocity: number) => void) {
        const i = (y * 8) + x;

        this.matrixMapping.set(i, cb);
    }

    setMatrixColorXY(x: number, y: number, pixel: Pixel) {
        this.matrixManager.setXYColor(x, y, pixel);
    }

    deleteMatrixColorXY(x: number, y: number, pixel: Pixel) {
        this.matrixManager.setXYColor(x, y, {
            "color": 0,
            lightMode: LightMode.Normal
        });
    }

    loadMatrixPattern(pat: number[]) {
        //console.log("loading", pat)
        this.matrixManager.setPattern(pat);
        if (this.redraw) this.redraw();
    }

    setControlMapping(button: BUTTON_DEF, cb: (pressed: boolean, cc: number) => void) {
        this.controlMapping.set(button, cb);
    }

    clearMatrix() {
        this.matrixManager.clear();
        //this.pixelsCallback.delete();
    }

    processInput(msg: MidiMessage) {
        switch (msg.type) {
            case "NoteOff":
            case "NoteOn":
                //this.onMatrixPressed(msg);
                this.matrixManager.processValue(msg.note, msg.velocity);
                this.events.dispatchEvent(new CustomEvent("matrix", { detail: { pressed: msg.type == "NoteOn", note: LaunchpadProMap().findIndex((v) => v == msg.note), velocity: msg.velocity } }))
                break;
            case "ControlChange":
                this.controlButtons.processValueChange(msg.cc, msg.value, this.events)
                break;
        }
    }

    close() {
        this.clearMatrix();
        this.controlMapping.clear();
        this.matrixMapping.clear();
        this.onClose();
    }

    abstract onClose(): void;
}