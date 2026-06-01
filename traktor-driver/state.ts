import { MidiDriver, MidiMessage } from "@driver-deno";

// rename to state.ts if done

const LoopCC = 2
const VolumeCC = 0

export enum DeckActionsCC {
    Volume = 0,
    LoopSetSelect = 2,
    LoopSetFeedback = 3
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

export enum LoopFeedbackStates {
    NoLoop = 0,
    Loop16th = 1,
    Loop8th = 2,
    Loop4th = 3,
    Loop2nd = 4,
    Loop1 = 5,
    Loop2 = 6,
    Loop4 = 7,
    Loop8 = 8,
    Loop16 = 9,
    Loop32 = 10,
}

export class TraktorState {
    /*state = new Map<number, number>(Object.values(DeckActions).filter((v, i) => !isNaN(Number(v))).map((v, i) => {
        return [Number(v), 0]
    }));*/

    notestate = new Map<string, number>([
        [DeckActionsMidi[DeckActionsMidi.MixerCue], 0],
        //["loop", 0],
        [DeckActionsMidi[DeckActionsMidi.PlayPause], 0],
        [DeckActionsMidi[DeckActionsMidi.Sync], 0],
        [DeckActionsMidi[DeckActionsMidi.HiKill], 0],
        [DeckActionsMidi[DeckActionsMidi.MidKill], 0],
        [DeckActionsMidi[DeckActionsMidi.LowKill], 0],
    ]);

    ccstate = new Map<string, number>([
        [DeckActionsCC[DeckActionsCC.Volume], 0],
        [DeckActionsCC[DeckActionsCC.LoopSetSelect], 0],
    ]);

    currentLoop = LoopFeedbackStates.NoLoop

    //loopState: LoopStates

    private traktorport: MidiDriver

    private events = new EventTarget();
    private channel: number;

    get addEventListener() {
        return ((listener: (event: CustomEvent<Map<string, number>>) => void) => {
            return this.events.addEventListener("update", (ev) => {
                listener(ev as CustomEvent)
            });
        })
    }

    addCCStateListener(key: DeckActionsCC, listener: (value: number) => void) {
        return this.events.addEventListener(DeckActionsCC[key], (ev) => {
            listener((ev as CustomEvent).detail)
        })
    }


    addNoteStateListener(key: DeckActionsMidi, listener: (value: number) => void) {
        return this.events.addEventListener(DeckActionsMidi[key], (ev) => {
            listener((ev as CustomEvent).detail)
        })

    }

    constructor(channel: number, port: MidiDriver) {
        this.channel = channel;

        port.addEventListenerChannel(channel, (ev) => {
            const evt = ev as CustomEvent;
            //if (evt.detail.channel !== this.channel) return;
            //console.log("------")

            switch (evt.detail.type) {
                case "NoteOn":
                case "NoteOff":
                    {
                        console.log("Traktor Input", evt.detail, DeckActionsMidi[evt.detail.note]);
                        this.processMidi(evt.detail);
                    }
                    break;

                case "ControlChange":
                    {
                        //   console.log(DeckActionsCC[evt.detail.cc])
                        //console.log(evt.detail, DeckActionsCC[evt.detail.cc]);
                        console.log("Traktor Input", evt.detail, DeckActionsCC[evt.detail.cc]);
                        this.processCC(evt.detail);
                    }
                    break;
            }
            //this.decks[evt.detail.channel - 1].processTraktorInput(evt.detail.note, evt.detail.velocity);
            this.sendGlobalUpdate();
        })

        this.traktorport = port;
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
                    //this.state.set("volume", msg.value);
                    this.setCCState(msg.cc, msg.value);
                }
                break;

            case DeckActionsCC.LoopSetSelect:
                {
                    //this.
                    this.setCCState(msg.cc, msg.value);
                }
                break;
        }
    }

    private setNoteState(key: DeckActionsMidi, value: number) {
        this.notestate.set(DeckActionsMidi[key], value)
        this.events.dispatchEvent(new CustomEvent(DeckActionsMidi[key], { detail: value }))
    }

    private setCCState(key: DeckActionsCC, value: number) {
        this.ccstate.set(DeckActionsCC[key], value)
        this.events.dispatchEvent(new CustomEvent(DeckActionsCC[key], { detail: value }))
    }

    private processMidi(msg: { note: DeckActionsMidi, velocity: number }) {

        switch (msg.note) {
            case DeckActionsMidi.PlayPause:
                //this.playing = evt.detail.velocity > 64;
                //this.state.set("playing", msg.velocity)
                this.setNoteState(DeckActionsMidi.PlayPause, msg.velocity)
                break;

            case DeckActionsMidi.LowKill:
                //this._lowkill = evt.detail.velocity > 64;
                //this.state.set("lowkill", msg.velocity);
                this.setNoteState(DeckActionsMidi.LowKill, msg.velocity);
                break;

            case DeckActionsMidi.MidKill:
                //this._midkill = evt.detail.velocity > 64;
                //this.state.set("midkill", msg.velocity);
                this.setNoteState(DeckActionsMidi.MidKill, msg.velocity);
                break;

            case DeckActionsMidi.HiKill:
                //this._hikill = evt.detail.velocity > 64;
                //this.state.set("hikill", msg.velocity);
                this.setNoteState(DeckActionsMidi.HiKill, msg.velocity);
                break;

            case DeckActionsMidi.Sync:
                //this.state.set("sync", msg.velocity);
                this.setNoteState(DeckActionsMidi.Sync, msg.velocity);
                break;

            case DeckActionsMidi.MixerCue:
                //this.state.set("mixercue", msg.velocity);
                this.setNoteState(DeckActionsMidi.MixerCue, msg.velocity);
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

    /*set loop(loop: LoopStates) {
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
    }*/

    set play(state: boolean) {
        //this.playing = state;
        this.sendTraktorMidi(DeckActionsMidi.PlayPause, state);
    }

    set sync(state: boolean) {
        this.sendTraktorMidi(DeckActionsMidi.Sync, state);
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

    sendTraktorCC(cc: DeckActionsCC, value: number) {
        return this.traktorport.sendMidi({
            type: "ControlChange",
            cc,
            value,
            channel: this.channel
        })

    }

    sendTraktorMidi(note: DeckActionsMidi, value: boolean) {
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

    private sendGlobalUpdate() {
        this.events.dispatchEvent(new CustomEvent("update", { detail: { cc: this.ccstate, note: this.notestate } }));
    }
}

