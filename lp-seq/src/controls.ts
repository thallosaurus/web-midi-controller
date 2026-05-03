import { MidiMessage } from "@driver";
import { Launchpad } from "./launchpad.ts";

enum BUTTON_DEF {
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


export abstract class ControlButtons {
    static LP_PRO_CC_MAP = new Map<number, keyof typeof BUTTON_DEF>(
        Object.entries(BUTTON_DEF)
            .filter(([key]) => !isNaN(Number(key)))
            .map(([key, value]) => [Number(key), value as keyof typeof BUTTON_DEF])
    );

    state = new Map<number, number>(
        Object.entries(BUTTON_DEF)
            .filter(([key]) => !isNaN(Number(key)))
            .map(([key]) => [Number(key), 0])
    )

    get reverse() {
        return new Map<number, string>(
            Object.entries(BUTTON_DEF)
                .filter(([key]) => !isNaN(Number(key)))
                .map(([key, value]) => [Number(key), value as string])
        )
    }

    private caller: Launchpad;

    constructor(caller: Launchpad) {
        this.caller = caller;
    }

    setCCState(cc: number, value: number) {
        this.state.set(cc, value);
        console.log(this.reverse.get(cc) + ": " + this.state.get(cc));

        this.caller.sendMidi({
            type: "ControlChange",
            cc: cc,
            value: value,
            channel: 1
        })
    }

    /*onInput(msg: MidiMessage) {
        switch (msg.type) {
            case "ControlChange":
                {
                    //this.setCCState(msg.cc, msg.value);
                }
                break;
        }
    }*/

    processMidiMessage(msg: MidiMessage) {
        switch (msg.type) {
            case "ControlChange":
                {
                    return this.reverse.get(msg.cc);
                }

            default:
                break;
        }
    }
}

interface AppState {

}

export class LaunchpadControlButtons extends ControlButtons {

    constructor(caller: Launchpad) {
        super(caller);
    }

    onInput(msg: MidiMessage) {
        switch (msg.type) {
            case "ControlChange":
                {
                    //this.setCCState(msg.cc, msg.value);
                }
                break;
        }
    }
}