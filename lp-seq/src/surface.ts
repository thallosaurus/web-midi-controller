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

    get notes() {
        return new Map<number, number>(Surface.LAUNCHPAD_PROGRAMMER_MAP.map((value, index) => [value, index]));
    }

    get map() {
        return new Map<number, Pixel>(Surface.LAUNCHPAD_PROGRAMMER_MAP.map((value, index) => [value, this.pixels.get(index)!]));
    }

    protected caller: Launchpad;

    constructor(caller: Launchpad) {
        this.caller = caller;
    }

    setXY(x: number, y: number, pixel: Pixel) {
        const i = (y * 8) + x;
        if (i >= 0 && i < 64) {
            this.setI(i, pixel);
        } else return;
    }

    setI(i: number, pixel: Pixel) {
        this.pixels.set(i, pixel);

        const note = Surface.LAUNCHPAD_PROGRAMMER_MAP[i];

        this.caller.sendMidi({
            type: pixel.color == 0 ? "NoteOff" : "NoteOn",
            note: note,
            velocity: pixel.color,
            channel: pixel.lightMode
        })
    }

    updateI(i: number, pixel: Pixel) {
        const note = Surface.LAUNCHPAD_PROGRAMMER_MAP[i];
        /*this.caller.sendMidi({
            type: "Aftertouch",
            note: note,
            velocity: pixel.color,
            channel: pixel.lightMode
        })*/
    }

    processMidiMessage(msg: MidiMessage) {
        switch (msg.type) {
            case "NoteOn":
            case "NoteOff":
            case "Aftertouch":
                {
                    return this.notes.get(msg.note);
                }
            default:
                break;
        }
    }

    clear() {
        this.pixels.clear();
        for (const note of Surface.LAUNCHPAD_PROGRAMMER_MAP) {
            this.caller.sendMidi({
                type: "NoteOff",
                note: note,
                velocity: 0,
                channel: 1
            })
        }
    }

    abstract onInput(msg: MidiMessage): void;
}

export class DemoSurface extends Surface {
    displayingAnimation = false;

    override onInput(msg: MidiMessage): void {
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
    onInput(msg: MidiMessage): void {
        switch (msg.type) {
            case "NoteOn":
            case "NoteOff":
                {
                    const note = this.processMidiMessage(msg)
                    if (note !== undefined) {
                        this.setI(note, {
                            color: msg.velocity,
                            lightMode: LightMode.Normal
                        });
                    }
                }
                break;
            case "ChannelPressure":
                {
                    const note = this.processMidiMessage(msg)
                    if (note !== undefined) {
                        this.updateI(note, {
                            color: msg.pressure,
                            lightMode: LightMode.Normal
                        });
                    }
                }
        }
    }
}
