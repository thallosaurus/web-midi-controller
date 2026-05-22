import { MidiMessage } from "@driver";
import { Launchpad } from "./launchpad.ts";

export enum LightMode {
    Normal = 1,
    Flashing = 2,
    Pulsing = 3
}

export interface Pixel {
    color: number,
    lightMode: LightMode
}


export enum BUTTON_DEF {
    LeftArrow = 91,
    RightArrow = 92,
    Session = 93,
    Note = 94,
    Chord = 95,
    Custom = 96,
    Sequencer = 97,
    Projects = 98,
    LED = 99,
    Shift = 90,
    UpArrow = 80,
    DownArrow = 70,
    Clear = 60,
    Duplicate = 50,
    Quantise = 40,
    FixedLength = 30,
    Play = 20,
    Rec = 10,
    RecArm = 1,
    Mute = 2,
    Solo = 3,
    Volume = 4,
    Pan = 5,
    Sends = 6,
    DeviceTempo = 7,
    StopClip = 8,
    Col1Sub = 101,
    Col2Sub = 102,
    Col3Sub = 103,
    Col4Sub = 104,
    Col5Sub = 105,
    Col6Sub = 106,
    Col7Sub = 107,
    Col8Sub = 108,
    Patterns = 89,
    Steps = 79,
    PatternSettings = 69,
    Velocity = 59,
    Probability = 49,
    Mutation = 39,
    MicroStep = 29,
    PrintToClip = 19,
}

export abstract class Surface {
    static LAUNCHPAD_PROGRAMMER_MAP = [
        81, 82, 83, 84, 85, 86, 87, 88,
        71, 72, 73, 74, 75, 76, 77, 78,
        61, 62, 63, 64, 65, 66, 67, 68,
        51, 52, 53, 54, 55, 56, 57, 58,
        41, 42, 43, 44, 45, 46, 47, 48,
        31, 32, 33, 34, 35, 36, 37, 38,
        21, 22, 23, 24, 25, 26, 27, 28,
        11, 12, 13, 14, 15, 16, 17, 18
    ];

    private pixels = new Map<number, Pixel>();
    private controlpixels = new Map<BUTTON_DEF, Pixel>();

    private notes() {
        return Surface.LAUNCHPAD_PROGRAMMER_MAP.map((value, index) => [value, index])
    }

    private map() {
        return Surface.LAUNCHPAD_PROGRAMMER_MAP.map((value, index) => [value, this.pixels.get(index)!])
    }

    get notes_() {
        return new Map<number, number>(Surface.LAUNCHPAD_PROGRAMMER_MAP.map((value, index) => [value, index]));
    }

    get map_() {
        return new Map<number, Pixel>(Surface.LAUNCHPAD_PROGRAMMER_MAP.map((value, index) => [value, this.pixels.get(index)!]));
    }

    protected caller: Launchpad;

    constructor(caller: Launchpad) {
        this.caller = caller;
    }

    setXY(x: number, y: number, pixel: Pixel | null) {
        const i = (y * 8) + x;
        if (i >= 0 && i < 64) {
            this.setI(i, pixel);
        } else return;
    }

    setI(i: number, pixel: Pixel | null) {
        if (pixel !== null) {

            this.pixels.set(i, pixel);
            console.debug(this.pixels);
        } else {
            this.pixels.delete(i);
            console.debug(this.pixels);
        }

        //const note = Surface.LAUNCHPAD_PROGRAMMER_MAP[i];
    }

    clearMatrix() {
        this.pixels.clear();
    }

    clearControlButtons() {
        this.controlpixels.clear();
    }

    setControlButton(i: BUTTON_DEF, pixel: Pixel | null) {
        if (pixel !== null) {
            this.controlpixels.set(i, pixel);
        } else {
            this.controlpixels.delete(i);
        }
    }

    public drawBuffer(sender: (msg: MidiMessage) => void) {

        //console.log(this.pixels);
        //console.log(this.controlpixels);
        this.clear(sender);
        // matrix
        for (let i = 0; i < 8 * 8; i++) {

            const pixel = this.pixels.get(i);
            if (pixel) {
                //console.log("drawing", Surface.LAUNCHPAD_PROGRAMMER_MAP[i], pixel)

                //for (const [i, pixel] of this.pixels) {
                sender({
                    type: "NoteOn",
                    note: Surface.LAUNCHPAD_PROGRAMMER_MAP[i],
                    channel: pixel.lightMode,
                    velocity: pixel.color
                })
            } else {
                sender({
                    type: "NoteOff",
                    note: Surface.LAUNCHPAD_PROGRAMMER_MAP[i],
                    channel: 1,
                    velocity: 0
                })

            }
        }
        for (const [midi, k] of Object.entries(BUTTON_DEF).filter(([value]) => !isNaN(Number(value)))) {
            const pixel = this.controlpixels.get(k as BUTTON_DEF);
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
        }
        //controlbuttons
        //for 
    }

    clear(sender: (msg: MidiMessage) => void) {
        //this.pixels.clear();
        for (const note of Surface.LAUNCHPAD_PROGRAMMER_MAP) {
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

    onMidiMessage(msg: MidiMessage) {
        switch (msg.type) {
            case "NoteOn":
                this.onMatrixPressed(msg);
                break;
            case "NoteOff":
                this.onMatrixReleased(msg);
                break;
            case "ControlChange":
                if (msg.value > 0) {
                    console.log("pressed", BUTTON_DEF[msg.cc])
                } else {
                    console.log("released", BUTTON_DEF[msg.cc])
                }
                break;
        }
    }

    abstract onMatrixPressed(msg: MidiMessage): void;
    abstract onMatrixReleased(msg: MidiMessage): void;
}

/**
 * @deprecated
 */
export class DemoSurface extends Surface {
    displayingAnimation = false;

    override onMatrixInput(msg: MidiMessage): void {
        if (this.displayingAnimation) return;
        this.clear();
        this.animation().then(() => {
            this.displayRandomColors();
        })

        return;
    }
    constructor(caller: Launchpad) {
        super(caller);

        this.displayRandomColors();
    }

    /**
     * @deprecated
     * @returns 
     */
    animation(): Promise<void> {
        return new Promise((res, rej) => {
            this.displayingAnimation = true

            setTimeout(() => {
                this.displayingAnimation = false;
                res();
            }, 1000);
        });
    }

    displayRandomColors() {
        for (let i = 0; i < 64; i++) {
            this.setI(i, {
                color: Math.floor(Math.random() * 127),
                lightMode: LightMode.Pulsing
            })
        }
    }
}

export class FeedbackSurface extends Surface {
    onMatrixInput(msg: MidiMessage): void {

    }
}
