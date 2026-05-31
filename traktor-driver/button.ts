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

    constructor(action: number) {
        //this.color = color;
        this.pixel = {
            color: 0,
            colorOff: 0,
            colorOn: 0,
            lightMode: LightMode.Normal
        }
        this.action = action;
        //this.handler = onInput;
    }

    abstract handler(button: Button, state: TraktorState, inputState: any): void;
}

enum TriggerMode {
    Direct,
    Latch
}

class NoteButton extends Button {
    mode: TriggerMode
    private internalState = false;

    override handler(button: Button, state: TraktorState, inputState: any): void {
        switch (this.mode) {
            case TriggerMode.Direct:
                state.sendTraktorMidi(this.action, inputState)
                this.pixel.color = inputState ? this.pixel.colorOn : this.pixel.colorOff
                break;
            case TriggerMode.Latch:
                if (inputState) {
                    this.internalState = !this.internalState;
                    state.sendTraktorMidi(this.action, this.internalState);
                    this.pixel.color = this.internalState ? this.pixel.colorOn : this.pixel.colorOff
                }
                break;
        }
        //this.pixel.color = inputState ? 127 : PlayColor
    }

    constructor(action: DeckActionsMidi, mode: TriggerMode) {
        super(action)
        this.mode = mode;
    }
}

class CCButton extends Button {
    override handler(button: Button, state: TraktorState, inputState: any): void {
        state.sendTraktorCC(this.action, inputState)
    }
}

class PlayPauseButton extends NoteButton {
    constructor() {
        super(DeckActionsMidi.PlayPause, TriggerMode.Latch)
        this.pixel.color = 127
        this.pixel.colorOn = PlayColor
        this.pixel.colorOff = 127
    }
}

class SyncButton extends NoteButton {
    constructor() {
        super(DeckActionsMidi.Sync, TriggerMode.Latch)
        this.pixel.color = SyncColor
        this.pixel.colorOff = SyncColor
        this.pixel.colorOn = 127
    }
}

class FwdButton extends NoteButton {
    constructor() {
        super(DeckActionsMidi.Fwd, TriggerMode.Direct)
        this.pixel.color = BkwdFwdColor
        this.pixel.colorOff = BkwdFwdColor
        this.pixel.colorOn = 127
    }
}

class BkwdButton extends NoteButton {
    constructor() {
        super(DeckActionsMidi.Bkwd, TriggerMode.Direct)
        this.pixel.color = BkwdFwdColor
        this.pixel.colorOff = BkwdFwdColor
        this.pixel.colorOn = 127
    }
}

class LowKillButton extends NoteButton {
    constructor() {
        super(DeckActionsMidi.LowKill, TriggerMode.Direct)
        this.pixel.color = KillColor
        this.pixel.colorOff = KillColor
        this.pixel.colorOn = KillColor
    }
}

class MidKillButton extends NoteButton {
    constructor() {
        super(DeckActionsMidi.MidKill, TriggerMode.Direct)
        this.pixel.color = KillColor
        this.pixel.colorOff = KillColor
        this.pixel.colorOn = KillColor
    }
}

class HiKillButton extends NoteButton {
    constructor() {
        super(DeckActionsMidi.HiKill, TriggerMode.Direct)
        this.pixel.color = KillColor
        this.pixel.colorOff = KillColor
        this.pixel.colorOn = KillColor
    }
}

class MixerCueButton extends NoteButton {
    constructor() {
        super(DeckActionsMidi.MixerCue, TriggerMode.Direct)
        this.pixel.color = CueColor
        this.pixel.colorOff = CueColor
        this.pixel.colorOn = CueColor
    }
}

//    [Loop4thButton, Loop2ndButton, Loop1Button, Loop2Button],
//    [Loop4Button, Loop8Button, Loop16Button, Loop32Button],

export function DeckMap() {
    return [
        [],
        [],
        [],
        [],
        [],
        [],
        [new LowKillButton(), new MidKillButton(), new HiKillButton(), new MixerCueButton()],
        [new PlayPauseButton(), new SyncButton(), new BkwdButton(), new FwdButton()],
    ]
}