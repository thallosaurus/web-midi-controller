import { MidiMessage } from "@driver";
import { Launchpad } from "./launchpad.ts";
import { ControlButtons } from "./controls.ts";
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

    setXYColor(x: number, y: number, pixel: Pixel | null) {
        const i = (y * 8) + x;
        if (i >= 0 && i < 64) {
            this.setIColor(i, pixel);
        } else return;
    }

    setIColor(i: number, pixel: Pixel | null) {
        if (pixel !== null) {

            this.pixels.set(i, pixel);
            //console.debug(this.pixels);
        } else {
            this.pixels.delete(i);
            //console.debug(this.pixels);
        }
        //const note = Surface.LAUNCHPAD_PROGRAMMER_MAP[i];
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

    public renderState() {
        return {
            matrix: this.matrixManager.renderState,
            controls: this.controlButtons.renderState
        }
    }
    //    private controlpixels = new Map<BUTTON_DEF, Pixel>();

    /*    public controlpixelsActions = new Map<number, (msg: MidiMessage) => void>();*/
    protected caller: Launchpad;

    constructor(caller: Launchpad) {
        this.caller = caller;

        this.matrixManager.setIColor(81, {
            "color": 127,
            "lightMode": LightMode.Normal
        })
    }



    /*setMatrixCallbackXY(x: number, y: number, onTap: ((pressed: boolean, msg: MidiMessage) => void) | null) {
        const i = (y * 8) + x;
        if (i >= 0 && i < 64) {
            this.setMatrixCallbackI(i, onTap);
        } else return;
    }

    setMatrixCallbackI(i: number, onTap: ((pressed: boolean, msg: MidiMessage) => void) | null) {
        if (onTap) {
            if (onTap !== null) {
                this.pixelsCallback.set(i, onTap);
            } else {
                this.pixelsCallback.delete(i);
            }
        }
    }*/

    loadMatrix(pixels: Map<number, Pixel>) {
        //this.pixels = pixels;
    }

    clearMatrix() {
        this.matrixManager.clear();
        //this.pixelsCallback.delete();
    }

    /*clearControlButtons() {
        this.controlpixels.clear();
    }*/

    /*setControlButton(i: BUTTON_DEF, pixel: Pixel | null) {
        if (pixel !== null) {
            this.controlpixels.set(i, pixel);
        } else {
            this.controlpixels.delete(i);
        }
    }*/

    public drawBufferToSession() {
        this.drawBuffer((p) => {
            this.caller.sendSessionMidi(p);
        })
    }

    private drawBuffer(sender: (msg: MidiMessage) => void) {
        //console.log(this.pixels);
        //console.log(this.controlpixels);
        //this.clearMatrix();

        const buf = this.renderState();

        for (const p in buf.matrix) {
            console.log(p);
        }
        // matrix
        /*for (let i = 0; i < 8 * 8; i++) {

            const pixel = this.pixels.get(i);
            if (pixel) {
                //console.log("drawing", Surface.LAUNCHPAD_PROGRAMMER_MAP[i], pixel)

                //for (const [i, pixel] of this.pixels) {
                sender({
                    type: "NoteOn",
                    note: LaunchpadProMap()[i],
                    channel: pixel.lightMode,
                    velocity: pixel.color
                })
            } else {
                sender({
                    type: "NoteOff",
                    note: LaunchpadProMap()[i],
                    channel: 1,
                    velocity: 0
                })

            }
        }*/
        /*for (const [midi, pixel] of this.controlButtons.getCCFrameBuffer()) {

            //const pixel = this.controlpixels.get(k as BUTTON_DEF);
            //console.log(k, pixel);
            if (pixel) {
                sender({
                    type: "ControlChange",
                    cc: Number(midi),
                    channel: pixel.lightMode,
                    value: pixel.color
                })
            } else {
                sender({
                    type: "ControlChange",
                    cc: Number(midi),
                    channel: 1,
                    value: 0
                })
            }
        }*/
        //controlbuttons
        //for 
    }

    /**
     * @deprecated
     * @param sender
     */
    clear(sender: (msg: MidiMessage) => void) {
        //this.pixels.clear();
        for (const note of LaunchpadProMap()) {
            /*this.caller.sendMidi({
                type: "NoteOff",
                note: note,
                velocity: 0,
                channel: 1
            })*/
            sender({
                type: "NoteOff",
                note: note,
                velocity: 0,
                channel: 1
            })
        }
    }

    processInput(msg: MidiMessage) {
        switch (msg.type) {
            case "NoteOff":
            case "NoteOn":
                //this.onMatrixPressed(msg);
                this.matrixManager.processValue(msg.note, msg.velocity);
                this.events.dispatchEvent(new CustomEvent("matrix", { detail: { pressed: msg.type == "NoteOn", state: this.matrixManager.pixels.get(msg.note) } }))
                break;
            case "ControlChange":
                this.controlButtons.processValueChange(msg.cc, msg.value, this.events)
                break;
        }
    }

    close() {
        this.onClose();
    }

    abstract onClose(): void;
}