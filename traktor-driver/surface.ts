import { LightMode, Pixel, Surface } from "../launchpad-driver/src/surface.ts";
import { MidiDriver } from "@driver-deno";
import { DeckActionsCC, DeckActionsMidi, TraktorState } from "./state.ts";
import { Button, DeckMap } from "./button.ts";

class Deck {
    channel: number
    surface: TraktorSurface
    state: TraktorState

    mapping: Button[][] = []

    constructor(channel: number, surface: TraktorSurface) {
        this.channel = channel;
        this.surface = surface;
        //this.state = surface.traktorState;
        this.state = new TraktorState(this.channel, surface.traktorDriver)
        this.setMatrixMappings(DeckMap(this.state))

        this.state.addEventListener((ev) => {
            console.log("deck", ev);
            if (this.surface.redraw) {
                console.log("redraw");

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
        const p = b.pixel;
        this.surface.setMatrixXY(offset + x, y, b.pixel, (pp) => {
            //this.sendAction(action, pp);
            //b.onInput(this.state, pp)
            b.handler(this.state, pp);
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
        this.mapping = map
    }

    updateMatrix() {
        for (let y = 0; y < this.mapping.length; y++) {
            for (let x = 0; x < this.mapping[y].length; x++) {
                //const { action, color } = DECK_MAP[y][x]
                const btn = this.mapping[y][x];

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
    }
}