import { MidiDriver } from "@hdj/midi-driver/ffi";
import { ControlState, TickState } from "./client/protocol.ts";


interface SetStep {
    type: "setStepOnSequence",
    sequenceId: number,
    stepId: number,
    state: number
}

interface AddSequenceLane {
    type: "addSequenceLane",
    note: number,
    channel: number,
    length?: number
}

interface RemoveLastSequenceLane {
    type: "removeLastSequenceLane"
}

type MutationActions = SetStep | AddSequenceLane | RemoveLastSequenceLane

type Step = {
    velocity?: number
    active: boolean
}

const KICK = [
    127, 0, 0, 0,
    127, 0, 0, 0,
    127, 0, 0, 0,
    127, 0, 0, 0,
]

const SNARE = [
    0, 0, 0, 0,
    127, 0, 0, 0,
    0, 0, 0, 0,
    127, 0, 0, 0,
]

const HI_HAT = [
    0, 0, 127, 0,
    0, 0, 127, 0,
    0, 0, 127, 0,
    0, 0, 127, 0,
]

function createSteps(pattern: number[] = []) {
    return pattern.map((v, i) => {
        return {
            //note,
            velocity: v,
            active: v > 0
        }
    })
}

function createEmptySteps(length = 16): Step[] {
    const a = new Array(length).fill(0)
    return createSteps(a)
}

//const TICKS_PER_STEP = 6;

type Sequence = {
    note: number,
    channel: number,
    steps: Step[]
}
function createSequence(note = 36, channel = 1, steps = createEmptySteps()): Sequence {
    return {
        note,
        channel,
        steps
    }
}

export class StepSequencer {
    //private steps: Step[] = createEmptySteps(36);
    private sequences: Sequence[] = [
        createSequence(36, 1, createSteps(KICK)),
        createSequence(38, 1, createSteps(SNARE)),
        createSequence(42, 1, createSteps(HI_HAT)),
    ];

    private currentTick: number = 0;
    private currentStep = -1;

    private midi: MidiDriver
    //private currentStep: number = 0;
    /*get currentStep() {
        return Math.floor(this.currentTick / TICKS_PER_STEP);
    }*/

    constructor(midiPort: MidiDriver) {
        this.midi = midiPort
        console.log(this)
    }

    loadSequences(s: Sequence[]) {
        this.sequences = s;
    }

    private setStep(s: number, i: number, state = true) {
        if (s > this.sequences.length) {
            throw new Error("Sequence Index out of bounds")
        }

        if (i > this.sequences[s].steps.length) {
            throw new Error("Step Index out of bounds")
        }

        this.sequences[s].steps[i].active = state
    }

    mutate(action: MutationActions) {
        //process actions on the steps
        switch (action.type) {
            case "setStepOnSequence":
                this.setStep(action.sequenceId, action.stepId, action.state > 1)
                break;
            case "addSequenceLane":
                this.sequences = [
                    ...this.sequences,
                    createSequence(action.note, action.channel, createEmptySteps(action.length ?? 16))
                ]
                break;

            case "removeLastSequenceLane":
                this.sequences.pop();
                break;
        }
    }

    tick(t: TickState) {
        this.currentTick = t.tick;
        this.processTick();
    }

    control(c: ControlState) {
        switch (c.eventName) {
            case "Start":
                this.currentTick = 0;
                this.currentStep = -1;
                console.log("start");
                break;

            case "Stop":
                console.log("stop");
                break;

            case "Continue":
                console.log("continue");
                break;
        }
    }

    private processTick() {
        //console.log(this.currentStep);
        const s = Math.floor(this.currentTick / 6) % 16;
        if (this.currentStep != s) {
            this.currentStep = s;

            for (let s = 0; s < this.sequences.length; s++) {
                const seq = this.sequences[s];
                const step = seq.steps[this.currentStep];
                if (step && step.active) {
                    this.playStep(seq.channel, seq.note)
                }
            }
        }
    }

    private playStep(channel: number, note: number) {
        //console.log("playing", step)
        this.midi.sendMidi({
            "type": "NoteOn",
            "note": note,
            "channel": channel,
            "velocity": 127,
        })

        this.midi.sendMidi({
            "type": "NoteOff",
            "note": note,
            "channel": channel,
            "velocity": 0
        })
    }
}