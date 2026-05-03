import { MidiMessage } from "@driver";
import { Launchpad } from "./launchpad.ts";

enum LightMode {
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
        
        this.caller.midi.sendMidi({
            type: pixel.color == 0 ? "NoteOff" : "NoteOn",
            note: note,
            velocity: pixel.color,
            channel: pixel.lightMode
        })
    }
    
    updateI(i: number, pixel: Pixel) {
        const note = Surface.LAUNCHPAD_PROGRAMMER_MAP[i];
        this.caller.midi.sendMidi({
            type: "Aftertouch",
            note: note,
            velocity: pixel.color,
            channel: pixel.lightMode
        })
    }

    processMidiMessage(msg: MidiMessage) {
        switch (msg.type) {
            case "NoteOn":
            case "NoteOff":
            case "Aftertouch":
                {
                    const note = this.notes.get(msg.note);
                    return note;
                }

            default:
                break;
        }
    }

    clear() {
        this.pixels.clear();
        for (const note of Surface.LAUNCHPAD_PROGRAMMER_MAP) {
            this.caller.midi.sendMidi({
                type: "NoteOff",
                note: note,
                velocity: 0,
                channel: 1
            })
        }
    }

    abstract onInput(msg: MidiMessage): void;
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
            case "Aftertouch":
                {
                    const note = this.processMidiMessage(msg)
                    console.log("Aftertouch")
                    if (note !== undefined) {
                        this.updateI(note, {
                            color: msg.velocity,
                            lightMode: LightMode.Normal
                        });
                    }
                }
        }
    }
}