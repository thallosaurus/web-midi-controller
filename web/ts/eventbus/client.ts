import { uuid } from "@common/utils";
import { CoreWorkerClient } from "../coreworker/worker";
import { EventBusWorkerConsumerEvent, EventBusWorkerProducerEvent } from "./events";
import { type MidiMessage } from "../../../midi-driver/bindings/MidiPayload";

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

    events = new EventTarget();

    private sendMidiEvent(msg: MidiMessage) {
        this.events.dispatchEvent(new CustomEvent("data", {
            detail: msg
        }))
    }

    override processWorkerClientMessage(msg: EventBusWorkerProducerEvent): void {
        switch (msg.type) {
            case "midi-data":
                this.sendMidiEvent(msg as any);
            break;
            case "cc-update":
                {
                    let cb = this.callbacks.get(msg.consumerId)!;
                    cb.updateValue(msg.value);
                /*         this.events.dispatchEvent(new CustomEvent("ccdata", {
                        detail: {
                            ...msg
                        }
                    })) */
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
        this.init();

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

    registerCC(channel: number, cc: number, init: number, target: EventBusConsumer): Promise<string> {
        let id = uuid();
        return new Promise((res, rej) => {

            const fn = (ev: MessageEvent<EventBusWorkerProducerEvent>) => {
                switch (ev.data.type) {
                    case "register-cc-callback":
                        if (ev.data.consumerId == id) {

                            this.callbacks.set(ev.data.consumerId, target)
                            res(ev.data.consumerId)
                            this.worker.removeEventListener("message", fn);
                        }
                        break;
                }
            }
            this.worker.addEventListener("message", fn);
            this.send({
                type: "register-cc-widget",
                id,
                channel,
                cc,
                init
            })
        })
    }

    registerNote(channel: number, note: number, target: EventBusConsumer): Promise<string> {
        const id = uuid();
        return new Promise((res, rej) => {
            const fn = (ev: MessageEvent<EventBusWorkerProducerEvent>) => {
                switch (ev.data.type) {
                    case "register-note-callback":
                        if (ev.data.consumerId == id) {
                            this.worker.removeEventListener("message", fn);
                            this.callbacks.set(ev.data.consumerId, target)
                            res(ev.data.consumerId);
                        }
                        break;
                }
            }
            this.worker.addEventListener("message", fn);

            this.send({
                type: "register-note-widget",
                id,
                channel,
                note
            })
        })

    }

    unregisterCC(id: string, channel: number, cc: number): Promise<void> {
        return new Promise((res, rej) => {
            const fn = (ev: MessageEvent<EventBusWorkerProducerEvent>) => {
                switch (ev.data.type) {
                    case "unregister-cc-callback":
                        res();
                        this.worker.removeEventListener("message", fn);
                        break;
                }
            }
            this.send({
                type: "unregister-cc-widget",
                id,
                channel,
                cc
            })
        })
    }

    unregisterNote(id: string, channel: number, note: number): Promise<void> {
        return new Promise((res, rej) => {
            const fn = (ev: MessageEvent<EventBusWorkerProducerEvent>) => {
                switch (ev.data.type) {
                    case "register-note-callback":
                        this.worker.removeEventListener("message", fn);
                        res();
                        break;
                }
            }

            this.worker.addEventListener("message", fn);
            this.send({
                type: "unregister-note-widget",
                id, channel,
                note
            })
        })
    }

    updateCC(channel: number, cc: number, value: number) {
        this.send({
            type: "update-cc-value",
            channel,
            cc,
            value
        })
    }

    updateNote(channel: number, note: number, velocity: number) {
        this.send({
            type: "update-note-value",
            channel,
            note,
            value: velocity
        })

        //this.events.dispatchEvent(new CustomEvent("notedata", { detail: }))
    }
}