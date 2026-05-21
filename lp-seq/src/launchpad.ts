import { MidiDriver, type MidiMessage } from "@driver-deno";
import { Surface } from "./surface.ts";
import { BUTTON_DEF, LaunchpadControlButtons } from "./controls.ts";

export const NOVATION_SYSEX_HEADER = [0xF0, 0x00, 0x20, 0x29, 0x02, 0x0E];

export enum FaderOrientation {
    Vertical = 0,
    Horizontal = 1
}

export enum FaderBank {
    Volumes = 0,
    Pans = 1,
    Sends = 2,
    Devices = 3
}

export enum FaderType {
    Unipolar = 0,
    Bipolar = 1
}

export interface Fader {
    index: number,
    type: FaderType,
    controlchange: number,
    color: number
}

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

    private surface: Surface | null = null;
    private sessionSurface: Surface | null = null;

    private controlButtons: LaunchpadControlButtons = new LaunchpadControlButtons(this);

    constructor() {
        this.control.ignore(["TimingClock", "Unknown"])
        this.midi.ignore(["TimingClock", "Unknown", "ChannelPressure"])
        MidiDriver.initLogging();

        //this.controlButtons.setButtonState(BUTTON_DEF.LED, 64)

        this.control.emitter.addEventListener("data", (ev) => {
            const evt = ev as CustomEvent;
            console.log("DAW", evt.detail)
            if (this.sessionSurface) {
                this.sessionSurface.onInput(evt.detail);
            }
        })

        this.midi.emitter.addEventListener("data", (ev) => {
            //switch ((ev as CustomEvent).detail)
            const evt = ev as CustomEvent;
            console.log(evt.detail)
            this.controlButtons.onInput(evt.detail);

            if (this.surface) {
                this.surface.onInput(evt.detail);
            }
        });
    }

    close() {
        this.surface?.clear();
        this.sessionSurface?.clear();
        this.midi.close();
        this.control.close();
    }

    switchInbuiltLayout(layout: number, index: number) {
        this.control.sendMidi({
            type: "SysEx",
            data: [...NOVATION_SYSEX_HEADER, 0x00, layout, index, 0x00, 0xF7]
        });
    }

    switchToCustomMode(index: number) {
        this.switchInbuiltLayout(3, index)
    }

    switchToLiveMode() {
        this.control.sendMidi({
            type: "SysEx",
            data: [...NOVATION_SYSEX_HEADER, 0x0E, 0x00, 0xF7]
        });
    }

    switchToProgrammerMode() {
        this.control.sendMidi({
            type: "SysEx",
            data: [...NOVATION_SYSEX_HEADER, 0x0E, 0x01, 0xF7]
        });
    }

    switchToDawMode() {
        this.control.sendMidi({
            type: "SysEx",
            data: [...NOVATION_SYSEX_HEADER, 0x10, 0x01, 0xF7]
        })
    }

    setFader(bank: FaderBank, orientation: FaderOrientation, fader: Fader) {
        this.control.sendMidi({
            type: "SysEx",
            data: [...NOVATION_SYSEX_HEADER, 0x01, bank, orientation, fader.index, fader.type, fader.controlchange, fader.color]
        })
    }

    switchToStandaloneMode() {
        this.control.sendMidi({
            type: "SysEx",
            data: [...NOVATION_SYSEX_HEADER, 0x10, 0x00, 0xF7]
        })
    }

    loadSessionSurface(surface: Surface) {
        if (this.sessionSurface) this.sessionSurface.clear();
        this.sessionSurface = surface;
    }
    loadSurface(surface: Surface) {
        if (this.surface) this.surface.clear();
        this.surface = surface;
    }

    sendMidi(msg: MidiMessage) {
        this.midi.sendMidi(msg)
    }
}