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

export class Button {
    pixel: Pixel
    action: number
    handler: OnInputHandler

    lastState: boolean = false;

    constructor(action: number, color: number, onInput: OnInputHandler) {
        //this.color = color;
        this.pixel = {
            color,
            lightMode: LightMode.Normal
        }
        this.action = action;
        this.handler = onInput;
    }
}

const PlayButton = new Button(DeckActionsMidi.PlayPause, PlayColor, (btn: Button, state: TraktorState, input: boolean) => {
    console.log(btn, input)
    if (btn.lastState != input) {
        
    }
    state.play = input;

    //btn.pixel.color = input ? 127 : 0
});

const SyncButton = new Button(DeckActionsMidi.Sync, SyncColor, (b, s, i) => {
    console.log(b, s, i)
    s.sync = i
})

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
export const DECK_MAP: Button[][] = [
    [],
    [],
    [],
    [],
    [],
    [],
    [],
    [PlayButton, SyncButton],
];