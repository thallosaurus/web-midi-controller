import { MidiDriver } from "@hdj/midi-driver/ffi";
import { ControlState, TickState } from "./client/protocol.ts";

type Step = {
    note: number,
    velocity?: number,
    active: boolean
}

type CachedNote = {
    note: number,
    velocity: number,
    channel: number
}

function createEmptySteps(note: number, length = 16, velocity = 127): Step[] {
    const s = [];

    for (let i = 0; i < length; i++) {
        s.push({
            note,
            velocity,
            active: false
        })
    }

    return s;
}

const TICKS_PER_STEP = 6;

export class StepSequencer {
    private steps: Step[] = createEmptySteps(36);
    private currentTick: number = 0;
    private currentStep = -1;

    private midi: MidiDriver
    //private currentStep: number = 0;
    /*get currentStep() {
        return Math.floor(this.currentTick / TICKS_PER_STEP);
    }*/

    constructor(midiPort: MidiDriver) {
        this.midi = midiPort

        this.activateStep(0)
        //this.activateStep(2)
        this.activateStep(4)
        this.activateStep(8)
        this.activateStep(12)
        //console.log(this)
    }

    activateStep(i: number, state = true) {
        if (i > this.steps.length) {
            throw new Error("Step Index out of bounds")
        }

        this.steps[i].active = state
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
        const s = Math.floor(this.currentTick / TICKS_PER_STEP) % 16;
        if (this.currentStep != s) {
            this.currentStep = s;
            console.log(this.currentStep);
            const step = this.steps[s];
            if (step && step.active) {
                console.log("playing", step)
                this.midi.sendMidi({
                    "type": "NoteOn",
                    "note": step.note,
                    "channel": 1,
                    "velocity": step.velocity ?? 127,
                })

                this.midi.sendMidi({
                    "type": "NoteOff",
                    "note": step.note,
                    "channel": 1,
                    "velocity": 0
                })
            }
        }
    }
}