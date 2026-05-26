import { MidiDriver, type MidiMessage } from "@driver-deno";
import { LaunchpadProMap, LightMode, Surface } from "./surface.ts";
import { ControlButtons } from "./controls.ts";
//import { BUTTON_DEF, LaunchpadControlButtons } from "./controls.ts";

export const NOVATION_SYSEX_HEADER = [0xF0, 0x00, 0x20, 0x29, 0x02, 0x0E];

/*export enum FaderOrientation {
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
}*/

export enum LaunchpadSurfaceStore {
    Session,
    Custom
}

interface LaunchpadHandler {
    onMidiMessage: (msg: MidiMessage) => void;
    draw: () => void
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

    //private surface: Surface | null = null;
    private surface: Surface | null = null;
    private surfaceStorage: LaunchpadSurfaceStore | null = null

    constructor() {
        this.control.ignore(["TimingClock", "Unknown"])
        this.midi.ignore(["TimingClock", "Unknown"])
        MidiDriver.initLogging();

        //this.controlButtons.setButtonState(BUTTON_DEF.LED, 64)


        // events from the outer control buttons

    }

    processSysexMessage(msg: MidiMessage) {
        if (msg.type == "SysEx") {
            //const set = new Set(msg.data);
            //const diff = set.difference(new Set(NOVATION_SYSEX_HEADER));
            //console.log(diff);
            const hasNovationHeader = NOVATION_SYSEX_HEADER.every((byte, index) => msg.data[index] === byte);
            if (!hasNovationHeader) {
                console.log("Unknown SysEx manufacturer");
                return false;
            }

            const c = msg.data.filter((v, i) => i > NOVATION_SYSEX_HEADER.length);
            const [cmd, s] = c;
            const sub = s ?? null;

            console.log("current launchpad mode", cmd, sub);

            switch (cmd) {
                case 0:
                    this.drawToLaunchpad(LaunchpadSurfaceStore.Session);
                    //this.surface?.drawBufferToSession();
                    break;

                default:
                    return false;
            }
            // if launchpad switched to session mode
            if (cmd == 0) {
                this.drawToLaunchpad(LaunchpadSurfaceStore.Session);
                //this.surface?.drawBufferToSession();
            }
            return true;
        }
        return false
    }

    close() {
        //this.surface?.clear();
        //this.sessionSurface?.clear();
        this.surface?.close();
        this.midi.close();
        this.control.close();
    }

    switchInbuiltLayout(layout: number, page: number) {
        this.sendNovationMessage([0x00, layout, page, 0x00])
    }

    switchToCustomMode(page: number) {
        this.switchInbuiltLayout(3, page)
    }

    switchToLiveMode() {
        this.sendNovationMessage([0x0E, 0x00])
    }

    switchToProgrammerMode() {
        this.control.sendMidi({
            type: "SysEx",
            data: [...NOVATION_SYSEX_HEADER, 0x0E, 0x01, 0xF7]
        });
    }

    switchToDawMode() {
        this.sendNovationMessage([0x10, 0x01])
    }

    switchToStandaloneMode() {
        this.sendNovationMessage([0x10, 0x00])
    }

    private sendNovationMessage(data: number[]) {
        this.control.sendMidi({
            type: "SysEx",
            data: [...NOVATION_SYSEX_HEADER, ...data, 0xF7]
        })
    }

    private clearLaunchpad(store: LaunchpadSurfaceStore) {
        //this.pixels.clear();
        for (const note of LaunchpadProMap()) {
            /*this.caller.sendMidi({
                type: "NoteOff",
                note: note,
                velocity: 0,
                channel: 1
            })*/
            const dest = store == LaunchpadSurfaceStore.Session ? this.control : this.midi
            dest.sendMidi({
                type: "NoteOff",
                note: note,
                velocity: 0,
                channel: 1
            })
        }
    }

    drawToLaunchpad(store: LaunchpadSurfaceStore) {

        const dest = store == LaunchpadSurfaceStore.Session ? this.control : this.midi
        const buffer = this.surface?.renderState();
        console.log("digga", buffer);

        for (const [v, i] of buffer?.matrix!) {
            this.sendMidi(dest, {
                type: "NoteOn",
                channel: LightMode.Normal,
                note: v,
                velocity: i
            })
        }
    }

    loadSurface(store: LaunchpadSurfaceStore, surface: Surface) {
        this.clearLaunchpad(LaunchpadSurfaceStore.Session);
        this.clearLaunchpad(LaunchpadSurfaceStore.Custom);
        switch (store) {
            case LaunchpadSurfaceStore.Session:

                this.control.emitter.addEventListener("data", (ev) => {
                    const evt = ev as CustomEvent;

                    console.log("DAW")
                    // process sysex message
                    if (!this.processSysexMessage(evt.detail)) {
                        //was not a sysex message
                        //console.log("DAW", evt.detail)
                        this.surface?.processInput(evt.detail)
                    }

                    /*this.controlButtons.onInput(evt.detail);
                    if (this.sessionSurface) {
                        this.sessionSurface.onInput(evt.detail);
                        }*/
                })
                break;

            case LaunchpadSurfaceStore.Custom:
                this.midi.emitter.addEventListener("data", (ev) => {
                    //switch ((ev as CustomEvent).detail)
                    const evt = ev as CustomEvent;
                    console.log(evt.detail)
                    this.surface?.processInput(evt.detail)
                });
                break;
        }

        this.surface = surface;
        this.surfaceStorage = store;
    }

    sendMidi(destination: MidiDriver, msg: MidiMessage) {
        //this.midi.sendMidi(msg)

        destination.sendMidi(msg);
    }

    sendSessionMidi(msg: MidiMessage) {
        this.control.sendMidi(msg)
    }

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
}