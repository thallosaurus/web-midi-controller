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

        /*this.midi.emitter.addEventListener("data", (ev) => {
            //switch ((ev as CustomEvent).detail)
            const evt = ev as CustomEvent;

            switch (evt.detail.type) {
                default:
                    console.log(evt.detail)
                    break;
            }
        });*/
    }

    close() {
        //this.midi.close();
        this.control.close();
    }

    switchToCustomMode(index: number) {
        this.control.sendMidi({
            type: "SysEx",
            data: [0xF0, 0x00, 0x20, 0x29, 0x02, 0x0E, 0x00, 0x03, index, 0x00, 0xF7]
        });
    }
}

class Surface {
    static MAP = [

    ]
}