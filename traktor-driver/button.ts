import { StatementSync } from "node:sqlite";
import { LightMode, Pixel } from "../launchpad-driver/src/surface.ts";
import { TraktorState } from "./main.ts";
import { DeckActionsMidi } from "./state.ts";

const PlayColor = 64
const SyncColor = 61
const BkwdFwdColor = 28
const KillColor = 106
const CueColor = 56
const LoopColor = 67

type OnInputHandler = (button: Button, state: TraktorState, inputState: boolean) => void;

export abstract class Button {
    pixel: Pixel
    action: number
    //handler: OnInputHandler

    lastState: boolean = false;

    constructor(action: number, color: number) {
        //this.color = color;
        this.pixel = {
            color,
            lightMode: LightMode.Normal
        }
        this.action = action;
        //this.handler = onInput;
    }

    abstract handler(button: Button, state: TraktorState, inputState: boolean): void;
}

export class NoteButton extends Button {
    override handler(button: Button, state: TraktorState, inputState: boolean): void {
        state.sendTraktorMidi(this.action, inputState)
        this.pixel.color = inputState ? 127 : PlayColor
    }

    constructor(action: DeckActionsMidi, color: number) {
        super(action, color)
    }
}

/*export const SyncButton = new MidiButton(DeckActionsMidi.Sync, SyncColor);
export const BkwdButton = new MidiButton(DeckActionsMidi.Bkwd, BkwdFwdColor);
export const FwdButton = new MidiButton(DeckActionsMidi.Fwd, BkwdFwdColor);
export const LowKillButton = new MidiButton(DeckActionsMidi.LowKill, KillColor)
export const MidKillButton = new MidiButton(DeckActionsMidi.MidKill, KillColor)
export const HiKillButton = new MidiButton(DeckActionsMidi.HiKill, KillColor)
export const CueButton = new MidiButton(DeckActionsMidi.MixerCue, CueColor)

export const DECK_MAP_: Button[][] = [
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
*/

export function DeckMap() {
    return [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        [new NoteButton(DeckActionsMidi.PlayPause, PlayColor), new NoteButton(DeckActionsMidi.Sync, SyncColor)],
    ]
}
export const DECK_MAP: Button[][] = [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [new NoteButton(DeckActionsMidi.PlayPause, PlayColor), new NoteButton(DeckActionsMidi.Sync, SyncColor)],
];