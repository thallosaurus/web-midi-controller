import { MidiDriver } from "@driver-deno";

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

    Loop32th = 9,
    Loop16th = 10,
    Loop8th = 11,
    Loop4th = 12,
    Loop2nd = 13,
    Loop1 = 14,
    Loop2 = 15,
    Loop4 = 16,
    Loop8 = 17,
    Loop16 = 18,
    Loop32 = 19,
    LoopStatus = 20,

    SkipBkwd = 21,
    SkipFwd = 22,
    LoadSelectedTrack = 23,
    MasterSync = 24
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
    internalShiftState = false;

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
        this.setCCState(msg.cc, msg.value);
        /*switch (msg.cc) {
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
            case DeckActionsCC.LoopSetFeedback:
                {
                    this.setCCState(msg.cc, msg.value)
                }
        }*/
    }

    private setNoteState(key: DeckActionsMidi, value: number) {
        this.notestate.set(DeckActionsMidi[key], value)
        this.events.dispatchEvent(new CustomEvent(DeckActionsMidi[key], { detail: value }))
    }

    /**
     * Set State and fire an event
     * @param key 
     * @param value 
     */
    private setCCState(key: DeckActionsCC, value: number) {
        this.ccstate.set(DeckActionsCC[key], value)
        this.events.dispatchEvent(new CustomEvent(DeckActionsCC[key], { detail: value }))
    }

    private processMidi(msg: { note: DeckActionsMidi, velocity: number }) {
        this.setNoteState(msg.note, msg.velocity)
    }

    get triggerMidi() {
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

