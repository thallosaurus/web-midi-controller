import { MidiMessage } from "@driver";
import { BUTTON_DEF, ControlButtons } from "./controls.ts";

export enum LightMode {
    Normal = 1,
    Flashing = 2,
    Pulsing = 3
}

export interface Pixel {
    color: number,
    //colorOff: number,
    //colorOn: number,
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

function EmptyMatrixPixels() {
    return new Map<number, Pixel>(LaunchpadProMap().map((v) => {
        return [v, {
            "color": 0,
            "colorOn": 0,
            "colorOff": 0,
            "lightMode": LightMode.Normal
        }]
    }))
}

function EmptyControlPixels() {
    return LaunchpadProMap().map((v, i) => {
        return [v, 0]
    })
}

class MatrixManager {
    public pixels;

    private _state;

    constructor() {
        this.pixels = new Map<number, Pixel>(LaunchpadProMap().map((v) => {
            return [v, {
                "color": 0,
                "colorOn": 0,
                "colorOff": 0,
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
                    //"colorOn": b,
                    //"colorOff": b,
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

type MatrixHandler = (event: MatrixEvent) => void;
type ControlHandler = (event: ControlEvent) => void;

export interface MatrixEvent {
    pressed: boolean,
    note: number,
    velocity: number
}

interface ControlEvent {
    cc: number,
    state: number
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

    private width;

    /*private colorState = new Map<number, number>(LaunchpadProMap().map((v, i) => {
        return [v, 0]
        }));*/
    //private pixels = new Map<number, Pixel>();
    //private pixelsCallback = new Map<number, (pressed: boolean, msg: MidiMessage) => void>();
    //public controlButtons = new ControlButtons();
    //public matrixManager = new MatrixManager();

    //public matrixState = new Map<number, ;

    public matrixPixels = EmptyMatrixPixels();
    public controlPixels = EmptyControlPixels();

    controlState = new Map<number, number>();
    matrixState = new Map<number, number>()

    controlMapping = new Map<number, ControlHandler>()
    matrixMapping = new Map<number, MatrixHandler>()

    public renderState() {
        return {
            matrix: Array.from(this.matrixPixels.entries().map(([n, p], i) => {
                return [n, p.color]
            })),
            controls: Array.from(this.controlPixels.entries().map(([n, p], i) => {
                return p
            }))
        }
    }

    redraw: (() => void) | null = null
    //    private controlpixels = new Map<BUTTON_DEF, Pixel>();

    /*    public controlpixelsActions = new Map<number, (msg: MidiMessage) => void>();*/
    //protected caller: Launchpad;

    /**
     * register handler for when the control buttons receive an event
     */
    get addControlListener() {
        return (listener: (event: CustomEvent<ControlEvent>) => void) => {
            this.events.addEventListener("controls", (ev) => {
                listener(ev as CustomEvent)
            })
        }
    }

    /**
     * register handler for when the matrix receives an event
     */
    get addMatrixListener() {
        return (listener: (event: CustomEvent<MatrixEvent>) => void) => {
            this.events.addEventListener("matrix", (ev) => {
                listener(ev as CustomEvent)
            });
        }
    }

    constructor(width = 8) {
        //this.caller = caller;
        this.width = width;

        // register callback on control action
        this.addControlListener((evt) => {
            const b = this.controlMapping.get(evt.detail.cc);
            if (b) b(evt.detail);
            if (this.redraw) this.redraw();
        })

        // register callback on matrix action
        this.addMatrixListener((ev) => {
            const b = this.matrixMapping.get(ev.detail.note);
            if (b) {
                b(ev.detail)
                if (this.redraw) this.redraw();
            }
        })
    }

    /**
     * Gets typically set by Launchpad Class
     * @param cb 
     */
    setRedraw(cb: () => void) {
        this.redraw = cb;
    }

    setXYColor(x: number, y: number, pixel: Pixel) {
        const i = (y * 8) + x;
        if (i >= 0 && i < 64) {
            this.setIColor(i, pixel);
        } else return;
    }

    private setIColor(i: number, pixel: Pixel) {
        //console.debug("setting", i, "to", pixel)
        this.matrixPixels.set(LaunchpadProMap().at(i)!, pixel);
        //console.debug(this.pixels);
        //const note = Surface.LAUNCHPAD_PROGRAMMER_MAP[i];
    }

    setMatrixMappingXY(x: number, y: number, cb: MatrixHandler) {
        const i = (y * this.width) + x;

        this.matrixMapping.set(i, cb);
    }

    setMatrixColorXY(x: number, y: number, pixel: Pixel) {
        this.setXYColor(x, y, pixel);
    }

    private deleteMatrixColorXY(x: number, y: number) {
        this.setXYColor(x, y, {
            "color": 0,
            lightMode: LightMode.Normal
        });
    }

    loadMatrixPattern(pat: number[]) {
        //console.log("loading", pat)
        //this.matrixManager.setPattern(pat);
        for (let i = 0; i < pat.length; i++) {
            const b = pat.at(i);
            if (b) {
                //const color = this.active ? 66 : b;
                this.setIColor(i, {
                    "color": b,
                    //"colorOn": b,
                    //"colorOff": b,
                    "lightMode": LightMode.Normal
                })
            }
        }
        if (this.redraw) this.redraw();
    }

    setControlMapping(button: BUTTON_DEF, cb: ControlHandler) {
        this.controlMapping.set(button, cb);
    }

    clearMatrix() {
        this.matrixPixels.clear();
        //this.pixelsCallback.delete();
    }

    processInput(msg: MidiMessage) {
        switch (msg.type) {
            case "NoteOff":
            case "NoteOn":
                //this.onMatrixPressed(msg);
                //this.matrixManager.processValue(msg.note, msg.velocity);
                //this.matrixPixels.set(msg.note, msg.velocity);
                this.matrixState.set(msg.note, msg.velocity);
                this.events.dispatchEvent(new CustomEvent("matrix", { detail: { pressed: msg.type == "NoteOn", note: LaunchpadProMap().findIndex((v) => v == msg.note), velocity: msg.velocity } }))
                break;
            case "ControlChange":
                //this.controlButtons.processValueChange(msg.cc, msg.value, this.events)
                //this.con.set(msg.cc, msg.value);
                this.controlState.set(msg.cc, msg.value);
                this.events.dispatchEvent(new CustomEvent("controls", { detail: { pressed: msg.value > 64, cc: msg.cc } }))
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