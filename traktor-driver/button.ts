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

    colorOff: number = 0;
    colorOn: number = 0;

    constructor(action: number) {
        //this.color = color;
        this.pixel = {
            color: 0,
            //colorOff: 0,
            //colorOn: 0,
            lightMode: LightMode.Normal
        }
        this.action = action;
        //this.handler = onInput;
    }

    abstract handler(state: TraktorState, inputState: any): void;
    abstract internalHandler(state: TraktorState, inputState: any): void;
}

enum TriggerMode {
    Direct,
    Latch
}

class NoteButton extends Button {
    override internalHandler(inputState: any): void {
        this.pixel.color = inputState > 64 ? this.colorOn : this.colorOff
    }
    mode: TriggerMode
    private internalState = false;

    override handler(state: TraktorState, inputState: any): void {
        console.log(inputState)
        switch (this.mode) {
            case TriggerMode.Direct:
                state.sendTraktorMidi(this.action, inputState.pressed)
                //this.pixel.color = inputState ? this.colorOn : this.colorOff
                this.internalState = inputState.pressed;
                this.internalHandler(inputState);
                break;
            case TriggerMode.Latch:
                if (inputState.pressed) {
                    this.internalState = !this.internalState;
                    state.sendTraktorMidi(this.action, this.internalState);
                    //this.pixel.color = this.internalState ? this.colorOn : this.colorOff
                    this.internalHandler(this.internalState);
                }
                break;
            }
        //this.pixel.color = inputState ? 127 : PlayColor
    }

    constructor(action: DeckActionsMidi, mode: TriggerMode, state: TraktorState) {
        super(action)
        this.mode = mode;

        state.addNoteStateListener(action, (value) => {
            console.log("note button event", value)
            //this.internalState = value > 64
            this.internalHandler(value);
        })
    }
}

class CCButton extends Button {
    override internalHandler(inputState: any): void {
        throw new Error("Method not implemented.");
    }
    override handler(state: TraktorState, inputState: number): void {
        state.sendTraktorCC(this.action, inputState)
    }
}

class PlayPauseButton extends NoteButton {
    constructor(state: TraktorState) {
        super(DeckActionsMidi.PlayPause, TriggerMode.Latch, state)
        this.pixel.color = 127
        this.colorOn = PlayColor
        this.colorOff = 127
    }
}

class SyncButton extends NoteButton {
    constructor(state: TraktorState) {
        super(DeckActionsMidi.Sync, TriggerMode.Latch, state)
        this.pixel.color = SyncColor
        this.colorOff = SyncColor
        this.colorOn = 127
    }
}

class FwdButton extends NoteButton {
    constructor(state: TraktorState) {
        super(DeckActionsMidi.Fwd, TriggerMode.Direct, state)
        this.pixel.color = BkwdFwdColor
        this.colorOff = BkwdFwdColor
        this.colorOn = 127
    }
}

class BkwdButton extends NoteButton {
    constructor(state: TraktorState) {
        super(DeckActionsMidi.Bkwd, TriggerMode.Direct, state)
        this.pixel.color = BkwdFwdColor
        this.colorOff = BkwdFwdColor
        this.colorOn = 127
    }
}

class LowKillButton extends NoteButton {
    constructor(state: TraktorState) {
        super(DeckActionsMidi.LowKill, TriggerMode.Direct, state)
        this.pixel.color = KillColor
        this.colorOff = KillColor
        this.colorOn = KillColor
    }
}

class MidKillButton extends NoteButton {
    constructor(state: TraktorState) {
        super(DeckActionsMidi.MidKill, TriggerMode.Direct, state)
        this.pixel.color = KillColor
        this.colorOff = KillColor
        this.colorOn = KillColor
    }
}

class HiKillButton extends NoteButton {
    constructor(state: TraktorState) {
        super(DeckActionsMidi.HiKill, TriggerMode.Direct, state)
        this.pixel.color = KillColor
        this.colorOff = KillColor
        this.colorOn = KillColor
    }
}

class MixerCueButton extends NoteButton {
    constructor(state: TraktorState) {
        super(DeckActionsMidi.MixerCue, TriggerMode.Direct, state)
        this.pixel.color = CueColor
        this.colorOff = CueColor
        this.colorOn = CueColor
    }
}

//    [Loop4thButton, Loop2ndButton, Loop1Button, Loop2Button],
//    [Loop4Button, Loop8Button, Loop16Button, Loop32Button],

export function DeckMap(state: TraktorState) {
    return [
        [],
        [],
        [],
        [],
        [],
        [],
        [new LowKillButton(state), new MidKillButton(state), new HiKillButton(state), new MixerCueButton(state)],
        [new PlayPauseButton(state), new SyncButton(state), new BkwdButton(state), new FwdButton(state)],
    ]
}