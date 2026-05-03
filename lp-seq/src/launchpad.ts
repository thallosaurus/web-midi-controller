import { MidiDriver, MidiMessage } from "@driver";

export class Launchpad {
    private control = new MidiDriver({
        inputName: "Launchpad Pro MK3 LPProMK3 DAW",
        outputName: "Launchpad Pro MK3 LPProMK3 DAW",
        useVirtual: false
    })

    midi = new MidiDriver({
        inputName: "Launchpad Pro MK3 LPProMK3 MIDI",
        outputName: "Launchpad Pro MK3 LPProMK3 MIDI",
        useVirtual: false
    })

    private surface: Surface | null = null;

    constructor() {
        this.control.ignore(["TimingClock", "Unknown"])
        this.midi.ignore(["TimingClock", "Unknown"])
        MidiDriver.initLogging();

        this.midi.emitter.addEventListener("data", (ev) => {
            //switch ((ev as CustomEvent).detail)
            const evt = ev as CustomEvent;
            console.log(evt.detail)

            if (this.surface) {
                this.surface.onInput(evt.detail);
            }
        });

        /*setTimeout(() => {
            this.midi.sendMidi({
                type: "NoteOn",
                channel: 1,
                note: 18,
                velocity: 127
            })
        }, 100);*/
    }

    close() {
        this.midi.close();
        this.control.close();
    }

    switchToCustomMode(index: number) {
        this.control.sendMidi({
            type: "SysEx",
            data: [0xF0, 0x00, 0x20, 0x29, 0x02, 0x0E, 0x00, 0x03, index, 0x00, 0xF7]
        });
    }

    switchToLiveMode() {
        this.control.sendMidi({
            type: "SysEx",
            data: [0xF0, 0x00, 0x20, 0x29, 0x02, 0x0E, 0x0E, 0x00, 0xF7]
        });
    }

    switchToProgrammerMode() {
        this.control.sendMidi({
            type: "SysEx",
            data: [0xF0, 0x00, 0x20, 0x29, 0x02, 0x0E, 0x0E, 0x01, 0xF7]
        });
    }

    loadSurface(surface: Surface) {
        this.surface = surface;
    }
}

abstract class Surface {
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

    private pixels = new Map<number, number>();

    get notes() {
        return new Map<number, number>(Surface.LAUNCHPAD_PROGRAMMER_MAP.map((value, index) => [value, index]));
    }

    get map() {
        return new Map<number, number>(Surface.LAUNCHPAD_PROGRAMMER_MAP.map((value, index) => [value, this.pixels.get(index) ?? 0]));
    }

    protected caller: Launchpad;

    constructor(caller: Launchpad) {
        this.caller = caller;
    }

    setXY(x: number, y: number, color: number) {
        const i = (y * 8) + x;
        if (i >= 0 && i < 64) {
            this.setI(i, color);
        } else return;
    }

    setI(i: number, color: number) {
        this.pixels.set(i, color);

        const note = Surface.LAUNCHPAD_PROGRAMMER_MAP[i];

        this.caller.midi.sendMidi({
            type: color == 0 ? "NoteOff" : "NoteOn",
            note: note,
            velocity: color,
            channel: 1
        })
    }

    processMidiMessage(msg: MidiMessage) {
        switch (msg.type) {
            case "NoteOn":
            case "NoteOff":
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
    constructor(caller: Launchpad) {
        super(caller);

        console.log(this.notes);
    }
    onInput(msg: MidiMessage): void {
        //console.log("Feedback Surface", msg);

        switch (msg.type) {
            case "NoteOn":
            case "NoteOff":
                {
                    const note = this.processMidiMessage(msg)
                    if (note !== undefined) {
                        this.setI(note, msg.velocity);
                    }
                }
                break;
        }
    }
}