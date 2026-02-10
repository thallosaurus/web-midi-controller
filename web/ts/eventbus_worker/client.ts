import { CoreWorkerClient } from "../coreworker/worker";
import { EventBusWorkerConsumerEvent, EventBusWorkerProducerEvent } from "./events";

/**
 * The class a widget or whatever should implement when it wants to listen to the eventbus
 * usually through a Extension (See CCWidgetConsumer for example)
 */
export interface EventBusConsumer {
    //channel: number,

    consumerId: string | null
    /**
     * Gets called by the Event Bus Client as callback
     */
    updateValue(v: number): void;

    /**
     * Send this to update the value on the event bus
     * @param v 
     */
    sendValue(v: number): void;
}

export class EventbusWorkerClient extends CoreWorkerClient<EventBusWorkerProducerEvent, EventBusWorkerConsumerEvent> {
    callbacks = new Map<string, EventBusConsumer>();

    override processWorkerClientMessage(msg: EventBusWorkerProducerEvent): void {
        console.log("ebworker message", msg);
        switch (msg.type) {
            case "cc-update":
                {
                    let cb = this.callbacks.get(msg.consumerId)!;
                    cb.updateValue(msg.value);
                }
                break;

            case "note-update":
                {
                    let cb = this.callbacks.get(msg.consumerId)!;
                    cb.updateValue(msg.velocity);
                }
                break;

            case "unregister-cc-callback":
                this.callbacks.delete(msg.oldId)
                break;

            case "unregister-note-callback":
                this.callbacks.delete(msg.oldId);
                break;
        }
    }

    constructor() {
        super(new URL("eb_worker.ts", import.meta.url));
        //this.worker.onmessage = console.debug
        console.log("eb worker constructor")

/*        this.worker.onmessage = (e) => {
            console.log("RAW FROM WORKER", e, e.data);
        };*/
    }

    init() {
        return new Promise<void>((res, rej) => {

            if (!this.worker) rej(new Error("worker not ready"));

            const fn = (ev: MessageEvent<EventBusWorkerProducerEvent>) => {
                switch (ev.data.type) {
                    case "init-callback":

                        console.log(ev);
                        console.log("init")
                        this.worker.removeEventListener("message", fn);
                        res()
                        break;
                }
            }

            this.worker.addEventListener("message", fn);
            this.send({
                type: "init"
            })
        })
    }

    registerCC(channel: number, cc: number, init?: number) {
        this.send({
            type: "register-cc-widget",
            channel,
            cc,
            init
        })
    }

    registerNote(channel: number, note: number, target: EventBusConsumer) {
        this.send({
            type: "register-note-widget",
            channel,
            note
        })

    }

    unregisterCC(id: string, channel: number, cc: number) {
        this.send({
            type: "unregister-cc-widget",
            id,
            channel,
            cc
        })
    }

    unregisterNote(id: string, channel: number, note: number) {
        this.send({
            type: "unregister-note-widget",
            id, channel,
            note
        })
    }
}