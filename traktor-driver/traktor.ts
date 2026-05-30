import { channel } from "node:diagnostics_channel";
import { MidiDriver } from "../midi-driver/ffi.ts";
import { Launchpad, LaunchpadSurfaceStore } from "../launchpad-driver/src/launchpad.ts";
import { LightMode, Pixel, Surface } from "../launchpad-driver/src/surface.ts";
import { MidiMessage } from "@driver-deno";

const PlayColor = 64
const SyncColor = 61
const BkwdFwdColor = 28
const KillColor = 106
const CueColor = 56
const LoopColor = 67

const LoopCC = 2
const VolumeCC = 0

enum DeckActions {
    PlayPause = 1,
    Sync = 2,
    Fwd = 3,
    Bkwd = 4,
    LowKill = 5,
    MidKill = 6,
    HiKill = 7,
    MixerCue = 8,

    Loop16th = 9,
    Loop8th = 10,
    Loop4th = 11,
    Loop2nd = 12,
    Loop1 = 13,
    Loop2 = 14,
    Loop4 = 15,
    Loop8 = 16,
    Loop16 = 17,
    Loop32 = 18,
}

class DeckButton {
    action: DeckActions
    color: number

    constructor(
        action: DeckActions, color: number) {
        this.action = action;
        this.color = color;
    }
}

const PlayButton = new DeckButton(DeckActions.PlayPause, PlayColor);
const SyncButton = new DeckButton(DeckActions.Sync, SyncColor);
const BkwdButton = new DeckButton(DeckActions.Bkwd, BkwdFwdColor);
const FwdButton = new DeckButton(DeckActions.Fwd, BkwdFwdColor);
const LowKillButton = new DeckButton(DeckActions.LowKill, KillColor)
const MidKillButton = new DeckButton(DeckActions.MidKill, KillColor)
const HiKillButton = new DeckButton(DeckActions.HiKill, KillColor)
const CueButton = new DeckButton(DeckActions.MixerCue, CueColor)
const Loop4thButton = new DeckButton(DeckActions.Loop4th, LoopColor)
const Loop2ndButton = new DeckButton(DeckActions.Loop2nd, LoopColor)
const Loop1Button = new DeckButton(DeckActions.Loop1, LoopColor)
const Loop2Button = new DeckButton(DeckActions.Loop2, LoopColor)
const Loop4Button = new DeckButton(DeckActions.Loop4, LoopColor)
const Loop8Button = new DeckButton(DeckActions.Loop8, LoopColor)
const Loop16Button = new DeckButton(DeckActions.Loop16, LoopColor)
const Loop32Button = new DeckButton(DeckActions.Loop32, LoopColor)

/**
 * Assignment for the Actions per Deck
 */
const MAP: DeckButton[][] = [
    [],
    [],
    [],
    [],
    [Loop4thButton, Loop2ndButton, Loop1Button, Loop2Button],
    [Loop4Button, Loop8Button, Loop16Button, Loop32Button],
    [LowKillButton, MidKillButton, HiKillButton, CueButton],
    [PlayButton, SyncButton, BkwdButton, FwdButton]
]

class Deck {
    channel: number
    surface: TraktorSurface

    constructor(channel: number, surface: TraktorSurface) {
        this.channel = channel;
        this.surface = surface;

        this.setMatrixMappings()
    }

    setMatrixDeckXY(x: number, y: number, p: Pixel, action: DeckActions) {
        if (x > 4 || x < 0) throw new Error("out of bounds");
        const offset = this.channel * 4;
        this.surface.setMatrixColorXY(offset + x, y, p)
        this.surface.setMatrixMappingXY(offset + x, y, (pp) => {
            this.sendAction(action, pp);
        })
    }

    updateMatrixDeckColorXY(x: number, y: number, color: number) {
        if (x > 4 || x < 0) throw new Error("out of bounds");
        this.surface.setMatrixColorXY(x, y, {
            color,
            lightMode: LightMode.Normal
        })
    }

    private setMatrixMappings() {
        for (let y = 0; y < MAP.length; y++) {
            for (let x = 0; x < MAP[y].length; x++) {
                const { action, color } = MAP[y][x]

                this.setMatrixDeckXY(x, y, {
                    color: color,
                    lightMode: LightMode.Normal
                }, action)
            }
        }
    }

    private sendNoteOff(note: number) {
        this.surface.sendMidiOut({
            type: "NoteOff",
            channel: (this.channel + 1),
            note: note,
            velocity: 0
        })
    }

    private sendNoteOn(note: number) {
        this.surface.sendMidiOut({
            type: "NoteOn",
            channel: (this.channel + 1),
            note: note,
            velocity: 127
        })
    }

    sendAction(action: DeckActions, p: boolean) {
        console.log("sending action", DeckActions[action], action, p ? "pressed" : "released")
        if (p) {
            this.sendNoteOn(action)
        } else {
            this.sendNoteOff(action)
        }
    }

    processTraktorInput(note: number, velocity: number) {
        console.log("setting", note, "to", velocity)
        //this.state.set(note, velocity);
        this.updateMatrix();
        //console.log(this.state);
        //this.surface.redraw!();
    }

    updateMatrix() {
        for (let y = 0; y < MAP.length; y++) {
            for (let x = 0; x < MAP[y].length; x++) {
                const { action, color } = MAP[y][x]

                //const inState = this.state.get(action)!;

                //if (inState > 0) {

                this.setMatrixDeckXY(x, y, {
                    color: color,
                    lightMode: LightMode.Normal
                }, action)
                /*} else {
                    this.setMatrixDeckXY(x, y, {
                        color: color,
                        lightMode: LightMode.Normal
                    }, action)

                }*/
            }
        }
    }
}

enum LoopStates {
    NoLoop = -1,
    Loop16th = 22,
    Loop8th = 33,
    Loop4th = 44,
    Loop2nd = 55,
    Loop1 = 66,
    Loop2 = 77,
    Loop4 = 88,
    Loop8 = 99,
    Loop16 = 110,
    Loop32 = 121,
}

class TraktorState {
    /*state = new Map<number, number>(Object.values(DeckActions).filter((v, i) => !isNaN(Number(v))).map((v, i) => {
        return [Number(v), 0]
    }));*/
    currentLoop = LoopStates.NoLoop
    playing = false
    volume = 0

    //loopState: LoopStates

    private traktorport: MidiDriver

    private events = new EventTarget();
    private channel: number;

    get addEventListener() {
        return this.events.addEventListener
    }

    constructor(channel: number, port: MidiDriver) {
        this.traktorport = port;
        this.channel = channel;

        this.traktorport.emitter.addEventListener("data", (ev) => {
            const evt = ev as CustomEvent;
            console.log(evt);

            if (evt.detail.channel === this.channel) {
                
            }

            //this.decks[evt.detail.channel - 1].processTraktorInput(evt.detail.note, evt.detail.velocity);
        })
    }

    set loop (loop: LoopStates) {
        this.currentLoop = loop;

        if (loop !== LoopStates.NoLoop) {
            this.traktorport.sendMidi({
                type: "ControlChange",
                "cc": LoopCC,
                "value": loop,
                "channel": this.channel
            })
        } else {
            //TODO implement turn off
        }
        this.sendUpdate();
    }

    set play (state: boolean) {
        this.playing = state;
        this.traktorport.sendMidi({
            "type": 
        })
        this.sendUpdate();
    }

    private sendUpdateToTraktor() {
        //this.traktorport.
    }
    private sendUpdate() {
        this.events.dispatchEvent(new CustomEvent("update", { detail: this.state }));
    }
}

class TraktorSurface extends Surface {
    override onClose(): void {
        //throw new Error("Method not implemented.");
    }

    traktorOutput = new MidiDriver({
        "inputName": "Traktor Virtual Input",
        "outputName": "Traktor Virtual Output",
        useVirtual: true
    })

    decks = [
        new Deck(0, this),
        new Deck(1, this)
    ];

    constructor() {
        super();

        // events that get sent on the traktor port
        this.traktorOutput.emitter.addEventListener("data", (ev) => {
            const evt = ev as CustomEvent;

            this.decks[evt.detail.channel - 1].processTraktorInput(evt.detail.note, evt.detail.velocity);
        })
    }

    sendMidiOut(msg: MidiMessage) {
        this.traktorOutput.sendMidi(msg);
    }
}

const launchpad = new Launchpad();
//launchpad.loadSurface(LaunchpadSurfaceStore.Session, new SmileySurface(launchpad));
launchpad.loadSurface(LaunchpadSurfaceStore.Session, new TraktorSurface());
launchpad.switchToDawMode();

//switch to session view
launchpad.switchInbuiltLayout(0, 0);


Deno.addSignalListener("SIGINT", () => {
    launchpad.switchToStandaloneMode();
    launchpad.close();
});