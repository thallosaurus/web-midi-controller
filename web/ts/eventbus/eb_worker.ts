import { CoreWorker } from "../coreworker/worker";
import { EventBusWorkerConsumerEvent, EventBusWorkerProducerEvent } from "./events";

type WidgetId = string;
type CCWidget = WidgetId[];
type CCChannel = Map<number, CCWidget>;
// midi_channel: CC number
//const cc_map = new Map<number, CCChannel>();

type NoteWidget = WidgetId[];
type NoteChannel = Map<number, NoteWidget>;
//const note_map = new Map<number, NoteChannel>();

export class EventBusWorker extends CoreWorker<EventBusWorkerConsumerEvent, EventBusWorkerProducerEvent> {
    cc = new Map<number, CCChannel>();
    notes = new Map<number, NoteChannel>();

    constructor() {
        super();
    }

    processWorkerInputMessage(e: EventBusWorkerConsumerEvent): void {
        switch (e.type) {
            case "init":
                console.log("initializing eventbus")
                this.initialize(16);
                this.send({
                    type: "init-callback"
                })
                break;
            case "update-cc-value":
                this.updateCC(e.channel, e.cc, e.value);
                break;
            case "update-note-value":
                this.updateNote(e.channel, e.note, e.value);
                break;
            case "register-cc-widget":
                {
                    this.registerCCWidget(e.id, e.channel, e.cc, e.init);
                    this.send({
                        type: "register-cc-callback", consumerId: e.id
                    })
                }
                break;

            case "register-note-widget":
                {
                    this.registerNoteWidget(e.id, e.channel, e.note, 0);
                    this.send({
                        type: "register-note-callback", consumerId: e.id
                    });
                }
                break
            case "unregister-note-widget":
                this.unregisterNoteWidget(e.id, e.channel, e.note);
                this.send({
                    type: "unregister-note-callback",
                    oldId: e.id
                });
                break;

            case "unregister-cc-widget":
                // TODO
                this.unregisterCCWidget(e.id, e.channel, e.cc)
                this.send({
                    type: "unregister-cc-callback",
                    oldId: e.id
                })
                break;
        }
    }

    initialize(channel_count: number) {
        console.log("initializing eventbus with " + channel_count + " channels each")
        for (let ch = 0; ch < channel_count; ch++) {
            const cc_channel = new Map<number, [WidgetId]>();//Array<CCCallback>>();
            this.cc.set(ch + 1, cc_channel);   //index + 1 for convenience
        }

        for (let ch = 0; ch < channel_count; ch++) {
            const note_channel = new Map<number, [WidgetId]>();//Array<NoteCallback>>();
            this.notes.set(ch + 1, note_channel);   //index + 1 for convenience
        }
    }

    registerNoteWidget(id: string, channel: number, note: number, value: number): string {
        const n = this.notes.get(channel)!;
        if (!n.has(note)) {
            n.set(note, []);
        }

        const nn = n.get(note)!;
        nn.push(id);

        /*this.send({
            type: "note-update",
            consumerId: id,
            velocity: 0,
            note,
            on: false
        })*/

        return id;
    }

    unregisterCCWidget(id: string, channel: number, cc: number) {
        const ccch = this.cc.get(channel)!;

        if (!ccch.has(cc)) {
            return
        }

        console.log("unregistering " + id + "  cc widget ", cc, " on channel ", channel);
        const ccmap = ccch.get(cc)!;

        const index = ccmap.findIndex((v, i) => {
            return v == id
        })

        // send unregister message
        //sendUnregisterCCCallback(id)

        return ccmap.splice(index, 1);
    }

    unregisterNoteWidget(id: string, channel: number, note: number) {
        const notech = this.notes.get(channel)!;

        if (!notech.has(note)) {
            return
        }

        console.log("unregistering " + id + " midi ", note, " on channel ", channel);
        const notemap = notech.get(note)!;
        const index = notemap.findIndex((v, i) => {
            return v == id
        })
        // send unregister message
        //sendUnregisterNoteCallback(id);

        return notemap.splice(index, 1);
    }

    registerCCWidget(id: string, channel: number, cc_number: number, init?: number) {
        const cc = this.cc.get(channel)!;
        if (!cc.has(cc_number)) {
            cc.set(cc_number, []);
        }
        const c = cc.get(cc_number)!;
        c.push(id);

        // send init
        /*this.send({
            type: "cc-update",
            consumerId: id,
            //channel,
            //cc: cc_number,
            value: (init ?? 0)
        })*/
    }

    updateCC(channel: number, cc_number: number, value: number) {
        const cc = this.cc.get(channel)!;

        if (!cc.has(cc_number)) return;

        for (const consumerId of cc.get(cc_number)!) {
            this.send({
                type: "cc-update",
                consumerId,
                value,
                cc: cc_number,
                channel
            })

            // update socket driver value
            this.send({
                type: "midi-data",
                data: {
                    type: "ControlChange",
                    channel,
                    cc: cc_number,
                    value
                }
            })
        }
    }

    updateNote(channel: number, note: number, velocity: number) {
        const ch = this.notes.get(channel)!;

        if (!ch.has(note)) return;

        for (const id of ch.get(note)!) {
            //send update
            //cb(velocity)
            this.send({
                type: "note-update",
                consumerId: id,
                channel,
                note,
                velocity,
                on: velocity > 0
            })

            if (velocity > 0) {

                this.send({
                    type: "midi-data",
                    data: {
                        type: "NoteOn",
                        channel,
                        note,
                        velocity
                    }
                })
            } else {
                this.send({
                    type: "midi-data",
                    data: {
                        type: "NoteOff",
                        channel,
                        note,
                        velocity
                    }
                })

            }
            //sendUpdateNoteWidget(id, channel, note, velocity, ext)
        }
    }
}

new EventBusWorker();