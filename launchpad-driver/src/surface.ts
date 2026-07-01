import { MidiMessage } from "@hdj/midi-driver";
import { BUTTON_DEF } from "./launchpad.ts";

/**
 * LED animation modes supported by the Launchpad.
 */
export enum LightMode {
    Normal = 1,
    Flashing = 2,
    Pulsing = 3
}

/**
 * Represents the visual state of a single Launchpad pad.
 */
export interface Pixel {

    /**
     * Number of the color, according to the Launchpad Manual
     */
    color: number,

    /**
     * Which Light Mode to use for the Pixel
     */
    lightMode: LightMode,
    //    onTap?: (msg: MidiMessage) => void
}

/**
 * Returns the Launchpad Pro MK3 note mapping in matrix order.
 */
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

type MatrixHandler = (event: MatrixEvent) => void;
type ControlHandler = (event: ControlEvent) => void;

/**
 * Event emitted when a matrix pad is pressed or released.
 */
export interface MatrixEvent {
    pressed: boolean,
    note: number,
    velocity: number
}

/**
 * Event emitted when a control button changes state.
 */
interface ControlEvent {
    cc: number,
    state: number
}

/**
 * Base class for Launchpad surfaces.
 *
 * Provides pixel storage, input routing, event dispatching and
 * rendering helpers for custom surface implementations.
 */
export abstract class Surface {
    public events = new EventTarget();

    private width;

    public matrixPixels = EmptyMatrixPixels();
    public controlPixels = EmptyControlPixels();

    controlState = new Map<number, number>();
    matrixState = new Map<number, number>()

    controlMapping = new Map<number, ControlHandler>()
    matrixMapping = new Map<number, MatrixHandler>()

    /**
     * Builds a serializable representation of the current surface state.
     */
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
     * Registers a listener for a specific control button.
     *
     * @param cc Control button identifier.
     * @param listener Callback invoked when the button state changes.
     */
    addControlListenerForKey(cc: BUTTON_DEF, listener: ((event: CustomEvent<ControlEvent>) => void)) {
        return this.events.addEventListener(BUTTON_DEF[cc], (ev) => {
            listener(ev as CustomEvent);
        })
    }

    /**
     * register handler for when the matrix receives an event
     */
    addMatrixListener(listener: (event: CustomEvent<MatrixEvent>) => void) {
        this.events.addEventListener("matrix", (ev) => {
            listener(ev as CustomEvent)
        });
    }

    /**
     * Creates a new surface instance.
     *
     * @param width Logical width of the matrix grid.
     */
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
     * Registers a callback that is invoked whenever the surface should be redrawn.
     *
     * @param cb Redraw callback provided by the Launchpad controller.
     */
    setRedraw(cb: () => void) {
        this.redraw = cb;
    }

    /**
     * Sets the color of a matrix pad using X/Y coordinates.
     */
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

    private setMatrixMappingXY(x: number, y: number, cb: MatrixHandler) {
        const i = (y * this.width) + x;

        this.matrixMapping.set(i, cb);
    }

    private setMatrixColorXY(x: number, y: number, pixel: Pixel) {
        this.setXYColor(x, y, pixel);
    }

    /**
     * Assigns a pixel state and input handler to a matrix position.
     *
     * @param x Horizontal matrix coordinate.
     * @param y Vertical matrix coordinate.
     * @param pixel Visual state to display.
     * @param handler Callback invoked when the pad receives input.
     */
    setMatrixXY(
        x: number,
        y: number,
        pixel: Pixel,
        handler: MatrixHandler
    ) {
        //if (x > 4 || x < 0) throw new Error("out of bounds");
        //const offset = (this.channel - 1) * 4;
        const p = pixel;
        this.setMatrixColorXY(x, y, p)
        this.setMatrixMappingXY(x, y, handler)
    }

    private deleteMatrixColorXY(x: number, y: number) {
        this.setXYColor(x, y, {
            "color": 0,
            lightMode: LightMode.Normal
        });
    }

    /**
     * Loads a color pattern into the matrix.
     *
     * @param pat Array of Launchpad color values.
     */
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

    /**
     * Associates a control button with a handler function.
     */
    setControlMapping(button: BUTTON_DEF, cb: ControlHandler) {
        this.controlMapping.set(button, cb);
    }

    clearMatrix() {
        this.matrixPixels.clear();
        //this.pixelsCallback.delete();
    }

    /**
     * Processes incoming MIDI messages and dispatches surface events.
     *
     * @param msg Incoming MIDI message.
     */
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
                this.events.dispatchEvent(new CustomEvent(BUTTON_DEF[msg.cc], { detail: { state: msg.value, cc: msg.cc } }))
                break;
        }
    }

    /**
     * Releases all resources associated with the surface.
     */
    close() {
        this.clearMatrix();
        this.controlMapping.clear();
        this.matrixMapping.clear();
        this.onClose();
    }

    /**
     * Called when the surface is being disposed.
     */
    abstract onClose(): void;
}