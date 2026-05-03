import { MidiDriver } from "@driver";

export class Launchpad {
    private control = new MidiDriver({
        inputName: "Launchpad Pro MK3 LPProMK3 DAW",
        outputName: "Launchpad Pro MK3 LPProMK3 DAW",
        useVirtual: false
    })

    private midi = new MidiDriver({
        inputName: "Launchpad Pro MK3 LPProMK3 MIDI",
        outputName: "Launchpad Pro MK3 LPProMK3 MIDI",
        useVirtual: false
    })

    constructor() {
        this.control.ignore(["TimingClock", "Unknown"])
        this.midi.ignore(["TimingClock", "Unknown"])
        MidiDriver.initLogging();

        this.midi.emitter.addEventListener("data", (ev) => {
            //switch ((ev as CustomEvent).detail)
            const evt = ev as CustomEvent;
            console.log(evt.detail)
        });

        setTimeout(() => {
            this.midi.sendMidi({
                type: "NoteOn",
                channel: 1,
                note: 18,
                velocity: 127
            })
        }, 100);
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
}

class Surface {
    static MIDI_MAP = [
        81, 82, 83, 84, 85, 86, 87, 88,
        71, 72, 73, 74, 75, 76, 77, 78,
        61, 62, 63, 64, 65, 66, 67, 68,
        51, 52, 53, 54, 55, 56, 57, 58,
        41, 42, 43, 44, 45, 46, 47, 48,
        31, 32, 33, 34, 35, 36, 37, 38,
        21, 22, 23, 24, 25, 26, 27, 28,
        11, 12, 13, 14, 15, 16, 17, 18
    ];

    get map() {
        return new Map<number, number>(Surface.MIDI_MAP.map((value, index) => [index, value]));
    }

    constructor() {
        
    }
}