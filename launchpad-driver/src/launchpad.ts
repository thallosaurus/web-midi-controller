import { MidiDriver, type MidiMessage } from "@driver-deno";
import { LaunchpadProMap, LightMode, Surface } from "./surface.ts";

export const NOVATION_SYSEX_HEADER = [0xF0, 0x00, 0x20, 0x29, 0x02, 0x0E];

export enum LaunchpadSurfaceStore {
    Session,
    Custom
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

export class Launchpad {
    private control: MidiDriver;
    private midi: MidiDriver;

    //private surface: Surface | null = null;
    private surface: Surface | null = null;
    private surfaceStorage: LaunchpadSurfaceStore | null = null

    constructor(midi = new MidiDriver({
        inputName: "Launchpad Pro MK3 LPProMK3 MIDI",
        outputName: "Launchpad Pro MK3 LPProMK3 MIDI",
        useVirtual: false
    }), control = new MidiDriver({
        inputName: "Launchpad Pro MK3 LPProMK3 DAW",
        outputName: "Launchpad Pro MK3 LPProMK3 DAW",
        useVirtual: false
    })) {
        this.midi = midi;
        this.midi.ignore(["TimingClock", "Unknown"])

        this.control = control;
        this.control.ignore(["TimingClock", "Unknown"])
        MidiDriver.initLogging();
    }

    private processSysexMessage(msg: MidiMessage) {
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
        //console.log("digga", buffer);

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
        surface.setRedraw(() => {
            this.drawToLaunchpad(this.surfaceStorage!);
        })
        switch (store) {
            case LaunchpadSurfaceStore.Session:

                this.control.addEventListener((evt) => {

                    //console.log("DAW", evt.detail)
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
                this.midi.addEventListener((evt) => {
                    //switch ((ev as CustomEvent).detail)
                    console.log(evt.detail)
                    this.surface?.processInput(evt.detail)
                });
                break;
        }

        this.surface = surface;
        this.surfaceStorage = store;
    }

    private sendMidi(destination: MidiDriver, msg: MidiMessage) {
        //this.midi.sendMidi(msg)

        destination.sendMidi(msg);
    }

    clear(destination: (msg: MidiMessage) => void) {
        //this.pixels.clear();
        for (const note of LaunchpadProMap()) {
            /*this.caller.sendMidi({
                type: "NoteOff",
                note: note,
                velocity: 0,
                channel: 1
            })*/
            destination({
                type: "NoteOff",
                note: note,
                velocity: 0,
                channel: 1
            })
        }
    }
}