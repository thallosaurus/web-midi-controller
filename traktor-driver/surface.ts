import { LightMode, Pixel, Surface } from "../launchpad-driver/src/surface.ts";
import { MidiDriver } from "@driver-deno";
import { DeckActionsCC, DeckActionsMidi, TraktorState } from "./state.ts";
import { Button, DeckMap } from "./button.ts";

/*const PlayButton = new DeckButton(DeckActionsMidi.PlayPause, PlayColor);
const SyncButton = new DeckButton(DeckActionsMidi.Sync, SyncColor);
const BkwdButton = new DeckButton(DeckActionsMidi.Bkwd, BkwdFwdColor);
const FwdButton = new DeckButton(DeckActionsMidi.Fwd, BkwdFwdColor);
const LowKillButton = new DeckButton(DeckActionsMidi.LowKill, KillColor)
const MidKillButton = new DeckButton(DeckActionsMidi.MidKill, KillColor)
const HiKillButton = new DeckButton(DeckActionsMidi.HiKill, KillColor)
const CueButton = new DeckButton(DeckActionsMidi.MixerCue, CueColor)*/
/*const Loop4thButton = new DeckButton(DeckActions.Loop4th, LoopColor)
const Loop2ndButton = new DeckButton(DeckActions.Loop2nd, LoopColor)
const Loop1Button = new DeckButton(DeckActions.Loop1, LoopColor)
const Loop2Button = new DeckButton(DeckActions.Loop2, LoopColor)
const Loop4Button = new DeckButton(DeckActions.Loop4, LoopColor)
const Loop8Button = new DeckButton(DeckActions.Loop8, LoopColor)
const Loop16Button = new DeckButton(DeckActions.Loop16, LoopColor)
const Loop32Button = new DeckButton(DeckActions.Loop32, LoopColor)*/

class Deck {
    channel: number
    surface: TraktorSurface
    state: TraktorState

    mapping: Button[][]=[]

    constructor(channel: number, surface: TraktorSurface) {
        this.channel = channel;
        this.surface = surface;
        //this.state = surface.traktorState;
        this.state = new TraktorState(this.channel, surface.traktorDriver)
        this.setMatrixMappings(DeckMap(this.state))

        this.state.addEventListener((ev) => {
            //console.log("deck", ev);
            if (this.surface.redraw) {
                console.log("redraw");
                this.surface.redraw();
            }
        })
    }

    private setMatrixDeckXY(x: number, y: number, b: Button) {
        if (x > 4 || x < 0) throw new Error("out of bounds");
        const offset = (this.channel - 1) * 4;
        const p = b.pixel;
        this.surface.setMatrixColorXY(offset + x, y, p)
        this.surface.setMatrixMappingXY(offset + x, y, (pp) => {
            //this.sendAction(action, pp);
            //b.onInput(this.state, pp)
            b.handler(this.state, pp);
            //this.redraw()
        })
    }

    /*updateMatrixDeckColorXY(x: number, y: number, color: number) {
        if (x > 4 || x < 0) throw new Error("out of bounds");
        this.surface.setMatrixColorXY(x, y, {
            color,
            lightMode: LightMode.Normal
        })
    }*/

    private setMatrixMappings(map: Button[][]) {
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                //const { action, pixel } = DECK_MAP[y][x]
                const btn = map[y][x];

                this.setMatrixDeckXY(x, y, btn /* action */)
            }
        }
        this.mapping = map
    }

    /*sendAction(action: DeckActions, p: boolean) {
        console.log("sending action", DeckActions[action], action, p ? "pressed" : "released")
        if (p) {
            this.sendNoteOn(action)
        } else {
            this.sendNoteOff(action)
        }
    }*/

    /*processTraktorInput(note: number, velocity: number) {
        console.log("setting", note, "to", velocity)
        //this.state.set(note, velocity);
        this.updateMatrix();
        //console.log(this.state);
        //this.surface.redraw!();
    }*/

    updateMatrix() {
        for (let y = 0; y < this.mapping.length; y++) {
            for (let x = 0; x < this.mapping[y].length; x++) {
                //const { action, color } = DECK_MAP[y][x]
                const btn = this.mapping[y][x];

                //const inState = this.state.get(action)!;

                //if (inState > 0) {

                this.setMatrixDeckXY(x, y, btn);
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

    //traktorState: TraktorState;

    decks: Deck[]

    traktorDriver = new MidiDriver({
        "inputName": "test virtual input",
        "outputName": "test virtual output",
        useVirtual: true
    });

    constructor() {
        super();

        this.decks = [
            new Deck(1, this),
            new Deck(2, this)
        ];

        //        this.traktorState = new TraktorState(1, this.traktorDriver)

        // events that get sent on the traktor port
        /*        this.traktorOutput.emitter.addEventListener("data", (ev) => {
                    const evt = ev as CustomEvent;
        
                    this.decks[evt.detail.channel - 1].processTraktorInput(evt.detail.note, evt.detail.velocity);
                })
                */
    }
}