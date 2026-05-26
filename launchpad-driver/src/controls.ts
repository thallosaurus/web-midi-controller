import { type MidiMessage } from "@driver";
import { Launchpad } from "./launchpad.ts";
import { Pixel } from "./surface.ts";

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


export class ControlButtons {
    static LP_PRO_CC_MAP = new Map<number, keyof typeof BUTTON_DEF>(
        Object.entries(BUTTON_DEF)
            .filter(([key]) => !isNaN(Number(key)))
            .map(([key, value]) => [Number(key), value as keyof typeof BUTTON_DEF])
    );

    private _state = new Map<number, number>(
        Object.entries(BUTTON_DEF)
            .filter(([key]) => !isNaN(Number(key)))
            .map(([key]) => [Number(key), 0])
    )

    colorState = new Map<BUTTON_DEF, Pixel>();

    public get renderState() {
        return Array.from(this.colorState.entries())
    }

    processValueChange(cc: number, value: number, events: EventTarget) {
        this._state.set(cc, value);
        events.dispatchEvent(new CustomEvent("controls", { detail: { pressed: value > 64, state: this._state.get(cc) }}))
        //console.log(BUTTON_DEF[cc] + ": " + this.state.get(cc));
    }
}

Deno.test({
    name: "lookup works",
    fn() {

    }
})