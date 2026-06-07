import { StatementSync } from "node:sqlite";
import { LightMode, Pixel } from "@hdj/launchpad-driver";
import { TraktorState } from "./main.ts";
import { DeckActionsCC, DeckActionsMidi, LoopFeedbackStates } from "./state.ts";

const PlayColor = 64
const SyncColor = 61
const BkwdFwdColor = 28
const KillColor = 106
const CueColor = 56
const LoopColor = 67

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
    }

    /**
     * handles the midi input, sends to traktor
     * @param state 
     * @param inputState 
     */
    abstract handler(state: TraktorState, inputState: any): void;

    shiftHandler?(state: TraktorState, inputState: any): void;

    /**
     * only updates the internal ui states, doesnt send to traktor
     * @param state 
     * @param inputState 
     */
    abstract internalHandler(state: TraktorState, inputState: any): void;
}

enum TriggerMode {
    Direct,
    Latch
}

class NoteButton extends Button {
    private internalState = false;
    mode: TriggerMode

    override internalHandler(inputState: any): void {
        this.pixel.color = inputState > 64 ? this.colorOn : this.colorOff
    }

    override handler(state: TraktorState, inputState: any): void {
        console.log(inputState)
        switch (this.mode) {
            case TriggerMode.Direct:
                //this.pixel.color = inputState ? this.colorOn : this.colorOff
                if (state.internalShiftState && this.shiftHandler) {
                    this.shiftHandler(state, inputState);
                } else {
                    this.internalState = inputState.pressed;
                    state.sendTraktorMidi(this.action, inputState.pressed)
                    this.internalHandler(inputState.velocity);
                }
                break;
            case TriggerMode.Latch:
                if (inputState.pressed) {
                    if (state.internalShiftState && this.shiftHandler) {
                        this.shiftHandler(state, inputState);
                    } else {
                        this.internalState = !this.internalState;
                        state.sendTraktorMidi(this.action, this.internalState);
                        //this.pixel.color = this.internalState ? this.colorOn : this.colorOff
                        this.internalHandler(this.internalState);
                    }
                }
                break;
        }
        //this.pixel.color = inputState ? 127 : PlayColor
    }

    constructor(action: DeckActionsMidi, mode: TriggerMode, state: TraktorState) {
        super(action)
        this.mode = mode;

        state.addNoteStateListener(action, (value) => {
            //console.log("note button event", value)
            //this.internalState = value > 64
            this.internalHandler(value);
        })
    }
}

class CCButton extends Button {
    override shiftHandler(state: TraktorState, inputState: any): void {
        throw new Error("Method not implemented.");
    }
    target: number;
    override internalHandler(inputState: any): void {
        this.pixel.color = inputState > 64 ? this.colorOn : this.colorOff
    }
    override handler(state: TraktorState, inputState: any): void {
        if (inputState.pressed) {
            //console.log("cc triggered", inputState)
            state.sendTraktorCC(this.action, this.target)
        }
    }

    constructor(action: DeckActionsCC, target: number, state: TraktorState) {
        super(action);
        this.target = target;
        state.addCCStateListener(action, (value) => {
            if (value == target) {
                console.log("update from traktor", action)
            }
        })
    }
}

class PlayPauseButton extends NoteButton {
    override shiftHandler(state: TraktorState, inputState: any): void {
        state.sendTraktorMidi(DeckActionsMidi.LoadSelectedTrack, inputState.pressed)
    }
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

    override shiftHandler(state: TraktorState, inputState: any): void {
        state.sendTraktorMidi(DeckActionsMidi.MasterSync, true);
    }
}

class FwdButton extends NoteButton {
    override shiftHandler(state: TraktorState, inputState: any): void {
        state.sendTraktorMidi(DeckActionsMidi.SkipFwd, inputState.pressed)
    }
    constructor(state: TraktorState) {
        super(DeckActionsMidi.Fwd, TriggerMode.Direct, state)
        this.pixel.color = BkwdFwdColor
        this.colorOff = BkwdFwdColor
        this.colorOn = 127
    }
}

class BkwdButton extends NoteButton {
    override shiftHandler(state: TraktorState, inputState: any): void {
        state.sendTraktorMidi(DeckActionsMidi.SkipBkwd, inputState.pressed)
    }
    constructor(state: TraktorState) {
        super(DeckActionsMidi.Bkwd, TriggerMode.Direct, state)
        this.pixel.color = BkwdFwdColor
        this.colorOff = BkwdFwdColor
        this.colorOn = 127
    }
}

class LowKillButton extends NoteButton {
    override shiftHandler(state: TraktorState, inputState: any): void {
        throw new Error("Method not implemented.");
    }
    constructor(state: TraktorState, mode = TriggerMode.Direct) {
        super(DeckActionsMidi.LowKill, mode, state)
        this.pixel.color = KillColor
        this.colorOff = 1
        this.colorOn = KillColor
    }
}

class MidKillButton extends NoteButton {
    constructor(state: TraktorState, mode = TriggerMode.Direct) {
        super(DeckActionsMidi.MidKill, mode, state)
        this.pixel.color = KillColor
        this.colorOff = 1
        this.colorOn = KillColor
    }
}

class HiKillButton extends NoteButton {
    constructor(state: TraktorState, mode = TriggerMode.Direct) {
        super(DeckActionsMidi.HiKill, mode, state)
        this.pixel.color = KillColor
        this.colorOff = 1
        this.colorOn = KillColor
    }
}

class MixerCueButton extends NoteButton {
    constructor(state: TraktorState) {
        super(DeckActionsMidi.MixerCue, TriggerMode.Latch, state)
        this.pixel.color = CueColor
        this.colorOff = CueColor
        this.colorOn = CueColor
    }
}

class LoopButton extends NoteButton {
    isLoopOn: boolean
    loopIndex: number;
    currentLoopIndex: number;

    override internalHandler(inputState: any): void {
        if ((this.loopIndex == this.currentLoopIndex) && this.isLoopOn) {
            this.pixel.color = this.colorOn
            // : this.colorOff
        } else {
            this.pixel.color = this.colorOff
        }
    }

    constructor(loop: DeckActionsMidi, state: TraktorState) {
        super(loop as number, 0, state)

        this.loopIndex = this.action - DeckActionsMidi.Loop32th
        this.currentLoopIndex = 0;

        this.isLoopOn = false;

        this.pixel.color = 66;
        this.colorOn = 66;
        this.colorOff = 60;
        state.addCCStateListener(DeckActionsCC.LoopSetFeedback, (val) => {
            //console.log(val, calc)
            this.currentLoopIndex = val;

            //this.internalHandler((this.loopIndex == val) && this.isLoopOn ? 127 : 0)
            this.internalHandler(null)
        })

        state.addNoteStateListener(DeckActionsMidi.LoopStatus, (v) => {
            this.isLoopOn = v != 0;
            this.internalHandler(null)
        })
    }

    override handler(state: TraktorState, inputState: any): void {
        console.log(inputState)

        if (inputState.pressed) {
            //            this.internalState = !this.internalState;
            state.sendTraktorMidi(this.action, true);
            //this.pixel.color = this.internalState ? this.colorOn : this.colorOff
            //            this.internalHandler(this.internalState);
        }

        //this.pixel.color = inputState ? 127 : PlayColor
    }
}

export function ShiftDeckMap(state: TraktorState) {
    return [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        []
    ]
}
export function DeckMap(state: TraktorState) {
    return [
        [],
        [],
        [],
        [new LoopButton(DeckActionsMidi.Loop8th, state), new LoopButton(DeckActionsMidi.Loop4th, state), new LoopButton(DeckActionsMidi.Loop2nd, state), new LoopButton(DeckActionsMidi.Loop1, state)],
        [new LoopButton(DeckActionsMidi.Loop2, state), new LoopButton(DeckActionsMidi.Loop4, state), new LoopButton(DeckActionsMidi.Loop8, state), new LoopButton(DeckActionsMidi.Loop16, state)],
        //[new LoopButton(LoopStates.Loop16th, state), new LoopButton(LoopStates.Loop8th, state), new LoopButton(LoopStates.Loop4th, state), new LoopButton(LoopStates.Loop2nd, state)],
        //[new LoopButton(LoopStates.Loop1, state), new LoopButton(LoopStates.Loop2, state), new LoopButton(LoopStates.Loop4, state), new LoopButton(LoopStates.Loop16, state)],
        [new LowKillButton(state), new MidKillButton(state), new HiKillButton(state)],
        [new LowKillButton(state, TriggerMode.Latch), new MidKillButton(state, TriggerMode.Latch), new HiKillButton(state, TriggerMode.Latch), new MixerCueButton(state)],
        [new PlayPauseButton(state), new SyncButton(state), new BkwdButton(state), new FwdButton(state)],
    ]
}