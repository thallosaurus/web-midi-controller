import { LightMode, Pixel, Surface } from "../launchpad-driver/src/surface.ts";
import { MidiDriver } from "@driver-deno";
import { DeckActionsCC, DeckActionsMidi, TraktorState } from "./state.ts";
import { Button, DeckMap, ShiftDeckMap } from "./button.ts";
import { BUTTON_DEF } from "../launchpad-driver/src/launchpad.ts";

enum GlobalTraktorActions {
    BrowserTreeUp = 1,
    BrowserTreeDown = 0,
    BrowserListUp = 3,
    BrowserListDown = 2,
}

class Deck {
    channel: number
    surface: TraktorSurface
    traktorstate: TraktorState

    mapping: Button[][] = []
    shiftMapping: Button[][] = []

    constructor(channel: number, surface: TraktorSurface) {
        this.channel = channel;
        this.surface = surface;
        //this.state = surface.traktorState;
        this.traktorstate = new TraktorState(this.channel, surface.traktorDriver)
        //this.setMatrixMappings()
        this.mapping = DeckMap(this.traktorstate)
        this.shiftMapping = ShiftDeckMap(this.traktorstate)

        this.updateMatrix(this.mapping)

        this.surface.addControlListenerForKey(BUTTON_DEF.Shift, (ev) => {
            this.traktorstate.internalShiftState = ev.detail.state > 64;
            //this.surface.clearMatrix();
            //this.updateMatrix(this.shiftMapping)
        })

        this.traktorstate.addEventListener((ev) => {
            //console.log("deck", ev);
            if (this.surface.redraw) {
                //console.log("redraw");

                this.surface.redraw();
                //this.updateMatrix()
            }
        })
    }

    private setMatrixDeckXY(
        x: number,
        y: number,
        b: {
            pixel: Pixel,
            handler: (state: TraktorState, inputState: any) => void
        }) {
        if (x > 4 || x < 0) throw new Error("out of bounds");
        const offset = (this.channel - 1) * 4;
        //const p = b.pixel;
        this.surface.setMatrixXY(offset + x, y, b.pixel, (pp) => {
            //this.sendAction(action, pp);
            //b.onInput(this.state, pp)
            b.handler(this.traktorstate, pp);
            //this.redraw()
        });
        //this.surface.setMatrixColorXY(offset + x, y, p)
        //this.surface.setMatrixMappingXY(offset + x, y, )
    }

    private setMatrixMappings(map: Button[][]) {
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                //const { action, pixel } = DECK_MAP[y][x]
                const btn = map[y][x];

                this.setMatrixDeckXY(x, y, btn /* action */)
            }
        }
    }

    updateMatrix(mapping: Button[][]) {
        for (let y = 0; y < mapping.length; y++) {
            for (let x = 0; x < mapping[y].length; x++) {
                //const { action, color } = DECK_MAP[y][x]
                const btn = mapping[y][x];

                //const inState = this.state.get(action)!;

                //if (inState > 0) {

                this.setMatrixDeckXY(x, y, btn);
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

    shift: boolean = false;

    traktorDriver: MidiDriver

    constructor(driver = new MidiDriver({
        "inputName": "test virtual input",
        "outputName": "test virtual output",
        useVirtual: true
    })) {
        super();
        this.traktorDriver = driver;

        this.decks = [
            new Deck(1, this),
            new Deck(2, this)
        ];

        this.addControlListenerForKey(BUTTON_DEF.Shift, (ev) => {
            this.shift = ev.detail.state > 64;
        })

        this.addControlListenerForKey(BUTTON_DEF.UpArrow, (ev) => {
            console.log("Up Arrow");
            //this.traktorstate.sendTraktorMidi()
            if (this.shift) {
                this.sendBrowserUp(ev.detail.state > 64);
            } else {
                this.sendListUp(ev.detail.state > 64)
            }
        })

        this.addControlListenerForKey(BUTTON_DEF.DownArrow, (ev) => {
            console.log("Down Arrow");
            //this.traktorstate.sendTraktorMidi()
            if (this.shift) {
                this.sendBrowserDown(ev.detail.state > 64);
            } else {
                this.sendListDown(ev.detail.state > 64)
            }
        })
    }

    sendBrowserUp(state: boolean) {
        this.sendGlobalCommand(GlobalTraktorActions.BrowserTreeUp, state)
    }

    sendBrowserDown(state: boolean) {
        this.sendGlobalCommand(GlobalTraktorActions.BrowserTreeDown, state)
    }

    sendListUp(state: boolean) {
        this.sendGlobalCommand(GlobalTraktorActions.BrowserListUp, state)
    }

    sendListDown(state: boolean) {
        this.sendGlobalCommand(GlobalTraktorActions.BrowserListDown, state)
    }

    sendGlobalCommand(note: GlobalTraktorActions, state: boolean) {
        this.traktorDriver.sendMidi({
            type: state ? "NoteOn" : "NoteOff",
            note,
            velocity: state ? 127 : 0,
            channel: 16
        })
    }
}