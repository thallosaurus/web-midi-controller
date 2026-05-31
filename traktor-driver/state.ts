import { MidiDriver, MidiMessage } from "@driver-deno";
import { threadId } from "node:worker_threads";

// rename to state.ts if done

const LoopCC = 2
const VolumeCC = 0

export enum DeckActionsCC {
    Volume = 0,
    LoopSetSelect = 2
}

export enum DeckActionsMidi {
    PlayPause = 1,
    Sync = 2,
    Fwd = 3,
    Bkwd = 4,
    LowKill = 5,
    MidKill = 6,
    HiKill = 7,
    MixerCue = 8,

    Loop16th = 9,
    Loop8th = 10,
    Loop4th = 11,
    Loop2nd = 12,
    Loop1 = 13,
    Loop2 = 14,
    Loop4 = 15,
    Loop8 = 16,
    Loop16 = 17,
    Loop32 = 18,
}

enum LoopStates {
    NoLoop = -1,
    Loop16th = 22,
    Loop8th = 33,
    Loop4th = 44,
    Loop2nd = 55,
    Loop1 = 66,
    Loop2 = 77,
    Loop4 = 88,
    Loop8 = 99,
    Loop16 = 110,
    Loop32 = 121,
}

export class TraktorState {
    /*state = new Map<number, number>(Object.values(DeckActions).filter((v, i) => !isNaN(Number(v))).map((v, i) => {
        return [Number(v), 0]
    }));*/

    state = new Map<string, number>([
        ["mixercue", 0],
        ["loop", 0],
        ["volume", 0],
        ["playing", 0],
        ["hikill", 0],
        ["midkill", 0],
        ["lowkill", 0],
    ]);
    currentLoop = LoopStates.NoLoop

    //loopState: LoopStates

    private traktorport: MidiDriver

    private events = new EventTarget();
    private channel: number;

    get addEventListener() {
        return ((listener: EventListener) => {
            return this.events.addEventListener("update", listener);
        })
    }

    constructor(channel: number, port: MidiDriver) {
        this.traktorport = port;
        this.channel = channel;

        this.traktorport.addEventListener((ev) => {
            const evt = ev as CustomEvent;
            if (evt.detail.channel !== this.channel) return;
            console.log("------")

            switch (evt.detail.type) {
                case "NoteOn":
                case "NoteOff":
                    {
                        console.log(evt.detail, DeckActionsMidi[evt.detail.note]);
                        this.processMidi(evt.detail);
                    }
                    break;

                case "ControlChange":
                    {
                        //   console.log(DeckActionsCC[evt.detail.cc])
                        console.log(evt.detail, DeckActionsCC[evt.detail.cc]);
                        this.processCC(evt.detail);
                    }
                    break;
            }
            //this.decks[evt.detail.channel - 1].processTraktorInput(evt.detail.note, evt.detail.velocity);
            this.sendUpdate();
        })
    }

    forward() {
        this.triggerMidi(DeckActionsMidi.Fwd);
    }

    backward() {
        this.triggerMidi(DeckActionsMidi.Bkwd);
    }

    private processCC(msg: { cc: DeckActionsCC, value: number }) {
        switch (msg.cc) {
            case DeckActionsCC.Volume:
                {
                    //this.volume = evt.detail.value
                    this.state.set("volume", msg.value);
                }
                break;

            case DeckActionsCC.LoopSetSelect:
                {
                    //this.
                    this.state.set("loop", msg.value)
                }
                break;
        }
    }

    private processMidi(msg: { note: DeckActionsMidi, velocity: number }) {

        switch (msg.note) {
            case DeckActionsMidi.PlayPause:
                //this.playing = evt.detail.velocity > 64;
                this.state.set("playing", msg.velocity)
                break;

            case DeckActionsMidi.LowKill:
                //this._lowkill = evt.detail.velocity > 64;
                this.state.set("lowkill", msg.velocity);
                break;

            case DeckActionsMidi.MidKill:
                //this._midkill = evt.detail.velocity > 64;
                this.state.set("midkill", msg.velocity);
                break;

            case DeckActionsMidi.HiKill:
                //this._hikill = evt.detail.velocity > 64;
                this.state.set("hikill", msg.velocity);
                break;

            case DeckActionsMidi.Sync:
                this.state.set("sync", msg.velocity);
                break;

            case DeckActionsMidi.MixerCue:
                this.state.set("mixercue", msg.velocity);
                break;

            default:
            case DeckActionsMidi.Fwd:
            case DeckActionsMidi.Bkwd:
            case DeckActionsMidi.Loop16th:
            case DeckActionsMidi.Loop8th:
            case DeckActionsMidi.Loop4th:
            case DeckActionsMidi.Loop2nd:
            case DeckActionsMidi.Loop1:
            case DeckActionsMidi.Loop2:
            case DeckActionsMidi.Loop4:
            case DeckActionsMidi.Loop8:
            case DeckActionsMidi.Loop16:
            case DeckActionsMidi.Loop32:
        }
    }

    set lowkill(state: boolean) {
        //this.lowkill = state;
        this.sendTraktorMidi(DeckActionsMidi.LowKill, state)
    }

    set midkill(state: boolean) {
        //this.lowkill = state;
        this.sendTraktorMidi(DeckActionsMidi.MidKill, state)
    }
    set hikill(state: boolean) {
        //this.lowkill = state;
        this.sendTraktorMidi(DeckActionsMidi.HiKill, state);
    }

    set loop(loop: LoopStates) {
        this.currentLoop = loop;

        if (loop !== LoopStates.NoLoop) {
            this.traktorport.sendMidi({
                type: "ControlChange",
                cc: LoopCC,
                value: loop,
                channel: this.channel
            })
        } else {
            //TODO implement turn off
        }
        //        this.sendUpdate();
    }

    set play(state: boolean) {
        //this.playing = state;
        this.sendTraktorMidi(DeckActionsMidi.PlayPause, state);
    }

    set vol(vol: number) {
        this.sendTraktorCC(VolumeCC, vol)

        //this.sendUpdate();
    }

    private get triggerMidi() {
        return (action: DeckActionsMidi) => {
            this.sendTraktorMidi(action, true);
            setTimeout(() => {
                this.sendTraktorMidi(action, false);
            }, 10)
        }
    }

    private get sendTraktorCC() {
        return (cc: DeckActionsCC, value: number) => {
            return this.traktorport.sendMidi({
                type: "ControlChange",
                cc,
                value,
                channel: this.channel
            })
        }
    }

    private get sendTraktorMidi() {
        return (note: DeckActionsMidi, value: boolean) => {
            if (value) {
                return this.traktorport.sendMidi({
                    type: "NoteOn",
                    note,
                    velocity: 127,
                    channel: this.channel
                })
            } else {
                return this.traktorport.sendMidi({
                    type: "NoteOff",
                    note,
                    velocity: 0,
                    channel: this.channel
                })
            }
        }
    }

    private sendUpdate() {
        this.events.dispatchEvent(new CustomEvent("update", { detail: this.state }));
    }
}

