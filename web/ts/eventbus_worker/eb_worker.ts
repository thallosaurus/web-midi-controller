import { uuid } from "../common/utils";
import { CoreWorker } from "../coreworker/worker";
import { EventBusWorkerConsumerEvent, EventBusWorkerEvent, EventBusWorkerProducerEvent } from "./events";
//import { WebsocketWorkerEvent } from "./events";

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
                this.send({
                    type: "init-callback"
                })
                break;
            case "update-cc-value":
                break;
            case "register-cc-widget":
                {

                    let consumerId = this.registerCCWidget(e.channel, e.cc, e.init);
                    this.send({
                        type: "register-cc-callback", consumerId
                    })
                }
                break;

            case "register-note-widget":
                {
                    let consumerId = this.registerNoteWidget(e.channel, e.note, 0);
                    this.send({
                        type: "register-note-callback", consumerId
                    });
                }
                break
            case "unregister-note-widget":
                this.send({
                    type: "unregister-note-callback",
                    oldId: e.id
                });
                break;

            case "unregister-cc-widget":
                // TODO
                this.send({
                    type: "unregister-cc-callback",
                    oldId: e.id
                })
                break;
        }
    }

    registerNoteWidget(channel: number, note: number, value: number): string {
        const id = uuid();
        const n = this.notes.get(channel);
        if (!n?.has(note)) {
            n?.set(note, []);
        }

        const nn = n?.get(note);
        nn?.push(id);

        this.send({
            type: "note-update",
            consumerId: id,
            velocity: 0,
            note,
            on: false
        })

        return id;
    }

    registerCCWidget(channel: number, cc_number: number, init?: number): string {
        const id = uuid();

        const cc = this.cc.get(channel);
        if (!cc?.has(cc_number)) {
            cc?.set(cc_number, []);
        }
        const c = cc?.get(cc_number);
        c?.push(id);

        // send init
        this.send({
            type: "cc-update",
            consumerId: id,
            //channel,
            //cc: cc_number,
            value: (init ?? 0)
        })

        return id
    }

    updateCC(channel: number, cc_number: number, value: number) {
        const cc = this.cc.get(channel);

        if (!cc?.has(cc_number)) return;

        for (const consumerId of (cc.get(cc_number)!)) {
            this.send({
                type: "cc-update",
                consumerId,
                value
            })
        }
    }
}

new EventBusWorker();