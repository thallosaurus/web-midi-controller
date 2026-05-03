import { MidiDriver, MidiMessage } from "@driver";
import { Surface } from "./surface.ts";
import { ControlButtons } from "./controls.ts";

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

    private metaControls: ControlButtons = new ControlButtons(this);

    constructor() {
        this.control.ignore(["TimingClock", "Unknown"])
        this.midi.ignore(["TimingClock", "Unknown"])
        MidiDriver.initLogging();

        this.midi.emitter.addEventListener("data", (ev) => {
            //switch ((ev as CustomEvent).detail)
            const evt = ev as CustomEvent;
            console.log(evt.detail)
            this.metaControls.onInput(evt.detail);

            if (this.surface) {
                this.surface.onInput(evt.detail);
            }
        });
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
        if (this.surface) this.surface.clear();

        this.surface = surface;
    }
}
