import { LightMode, Pixel, Surface } from "../launchpad-driver/src/surface.ts";
import { MidiDriver } from "@driver-deno";
import { DeckActionsCC, DeckActionsMidi, TraktorState } from "./state.ts";


const PlayColor = 64
const SyncColor = 61
const BkwdFwdColor = 28
const KillColor = 106
const CueColor = 56
const LoopColor = 67

class DeckButton {
    action: DeckActionsMidi | DeckActionsCC
    color: number

    constructor(
        action: DeckActionsMidi | DeckActionsCC, color: number) {
        this.action = action;
        this.color = color;
    }
}

const PlayButton = new DeckButton(DeckActionsMidi.PlayPause, PlayColor);
const SyncButton = new DeckButton(DeckActionsMidi.Sync, SyncColor);
const BkwdButton = new DeckButton(DeckActionsMidi.Bkwd, BkwdFwdColor);
const FwdButton = new DeckButton(DeckActionsMidi.Fwd, BkwdFwdColor);
const LowKillButton = new DeckButton(DeckActionsMidi.LowKill, KillColor)
const MidKillButton = new DeckButton(DeckActionsMidi.MidKill, KillColor)
const HiKillButton = new DeckButton(DeckActionsMidi.HiKill, KillColor)
const CueButton = new DeckButton(DeckActionsMidi.MixerCue, CueColor)
/*const Loop4thButton = new DeckButton(DeckActions.Loop4th, LoopColor)
const Loop2ndButton = new DeckButton(DeckActions.Loop2nd, LoopColor)
const Loop1Button = new DeckButton(DeckActions.Loop1, LoopColor)
const Loop2Button = new DeckButton(DeckActions.Loop2, LoopColor)
const Loop4Button = new DeckButton(DeckActions.Loop4, LoopColor)
const Loop8Button = new DeckButton(DeckActions.Loop8, LoopColor)
const Loop16Button = new DeckButton(DeckActions.Loop16, LoopColor)
const Loop32Button = new DeckButton(DeckActions.Loop32, LoopColor)*/

const MAP: DeckButton[][] = [
    [],
    [],
    [],
    [],
    [],
    [],
    //    [Loop4thButton, Loop2ndButton, Loop1Button, Loop2Button],
    //    [Loop4Button, Loop8Button, Loop16Button, Loop32Button],
    [LowKillButton, MidKillButton, HiKillButton, CueButton],
    [PlayButton, SyncButton, BkwdButton, FwdButton]
]

class Deck {
    channel: number
    surface: TraktorSurface
    state: TraktorState

    constructor(channel: number, surface: TraktorSurface) {
        this.channel = channel;
        this.surface = surface;
        this.state = surface.traktorState;

        this.setMatrixMappings()
    }

    private setMatrixDeckXY(x: number, y: number, p: Pixel, action: DeckActions) {
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

export class TraktorSurface extends Surface {
    override onClose(): void {
        //throw new Error("Method not implemented.");
    }

    traktorState: TraktorState;

    decks = [
        new Deck(0, this),
        new Deck(1, this)
    ];

    traktorDriver = new MidiDriver({
        "inputName": "test virtual input",
        "outputName": "test virtual output",
        useVirtual: true
    });

    constructor() {
        super();

        this.traktorState = new TraktorState(1, this.traktorDriver)

        // events that get sent on the traktor port
        /*        this.traktorOutput.emitter.addEventListener("data", (ev) => {
                    const evt = ev as CustomEvent;
        
                    this.decks[evt.detail.channel - 1].processTraktorInput(evt.detail.note, evt.detail.velocity);
                })
                */
    }
}