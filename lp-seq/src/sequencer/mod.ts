import { MidiMessage } from "../../../midi-driver/mod.ts";
import { LightMode, Surface } from "../surface.ts";

class DrumStep {
    note: number;
    state = false;
    constructor(note: number) {
        this.note = note;
    }
}

class DrumChannel {
    steps: DrumStep[] = [];
    note: number;

    constructor(note: number) {
        this.note = note;
        for (let i = 0; i < 8; i++) {
            this.steps.push(new DrumStep(note));
        }
    }
}

export class DrumSequencer extends Surface {
    private channels = [
        new DrumChannel(20),
        new DrumChannel(21),
        new DrumChannel(22),
        new DrumChannel(23),
        new DrumChannel(24),
        new DrumChannel(25),
        new DrumChannel(26),
        new DrumChannel(27),
    ]

    currentStep = 0;
    advance() {
        this.currentStep = (this.currentStep + 1) % 16
    }
    onInput(msg: MidiMessage): void {
        switch (msg.type) {
            case "NoteOn":
                {
                    let i = this.processMidiMessage(msg);

                    const c = {
                        x: i! % 8, y: Math.floor(i! / 8)
                    };

                    this.setI(i!, {
                        color: 127,
                        lightMode: LightMode.Normal
                    });
                }
                break;

            case "NoteOff":
                {
                    let i = this.processMidiMessage(msg);

                    const c = {
                        x: i! % 8, y: Math.floor(i! / 8)
                    };

                    const step = this.channels[c.y].steps[c.x];
                    const s = !step.state;
                    this.channels[c.y].steps[c.x].state = s;

                    this.setI(i!, {
                        color: s ? this.channels[c.y].note : 0,
                        lightMode: LightMode.Pulsing
                    });

                }
                break;
        }
    }
}