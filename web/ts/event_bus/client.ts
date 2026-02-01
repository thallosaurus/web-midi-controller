import { CCProperties, MidiProperties } from "@bindings/Widget";
import { uuid } from "../common/utils";
import { EventBusProducerMessage, EventBusProducerMessageType } from "./message";

interface EventBusProperties {
    midi_channels: number
}

// MARK: - Consumer/Client

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


function sendEventToWorker(worker: Worker | null, msg: EventBusConsumerMessage) {
    if (!worker) throw new Error("cant send on a null event bus")
    worker.postMessage(msg)
}

/** 
 * Messages that go IN to the Event Bus
 */
export enum EventBusConsumerMessageType {
    InitBus = "init_bus",
    RegisterCCWidget = "register_cc_widget",
    UnregisterCCWidget = "unregister_cc_widget",
    RegisterNoteWidget = "register_note_widget",
    UnregisterNoteWidget = "unregister_note_widget",
    ExternalCCUpdate = "external_cc_update",
    UpdateCCValue = "update_cc_value",
    ExternalNoteUpdate = "external_note_update",
    UpdateNoteValue = "update_note_value"
}

export type EventBusConsumerMessage =
    | InitBus
    | UpdateCCValue
    | UpdateJogValue
    | RegisterCCWidget
    | UnregisterCCWidget
    | UpdateNoteValue
    | ExternalNoteUpdate
    | ExternalCCUpdate
    | RegisterNoteWidget
    | UnregisterNoteWidget

interface InitBus extends EventBusProperties {
    type: EventBusConsumerMessageType.InitBus,
}

export function sendInitBus(midi_channels = 16) {
    sendEventToWorker(ebWorker, {
        type: EventBusConsumerMessageType.InitBus,
        midi_channels
    })
}

interface RegisterCCWidget {
    type: EventBusConsumerMessageType.RegisterCCWidget,
    id: string,
    channel: number,
    cc: number,
    value: number
}

export function sendRegisterCCWidget(id: string, channel: number, cc: number, value: number) {
    sendEventToWorker(ebWorker, {
        type: EventBusConsumerMessageType.RegisterCCWidget,
        id,
        channel,
        cc,
        value
    })
}

interface UnregisterCCWidget {
    type: EventBusConsumerMessageType.UnregisterCCWidget,
    id: string,
    channel: number,
    cc: number
}

export function sendUnregisterCCWidget(id: string, channel: number, cc: number) {
    sendEventToWorker(ebWorker, {
        type: EventBusConsumerMessageType.UnregisterCCWidget,
        id,
        channel,
        cc,
    })
}

interface UpdateNoteValue {
    type: EventBusConsumerMessageType.UpdateNoteValue,
    channel: number, note: number, velocity: number, on: boolean, external: boolean
}

export function sendUpdateNoteValue(channel: number, note: number, velocity: number, on: boolean, external: boolean) {
    sendEventToWorker(ebWorker, {
        type: EventBusConsumerMessageType.UpdateNoteValue,
        channel,
        note,
        velocity,
        on,
        external
    })
}


interface ExternalNoteUpdate {
    type: EventBusConsumerMessageType.ExternalNoteUpdate,
    //id: string,
    channel: number,
    note: number,
    velocity: number
    on: boolean
}

export function sendUpdateExternalNoteWidget(channel: number, note: number, velocity: number) {
    sendEventToWorker(ebWorker, {
        type: EventBusConsumerMessageType.ExternalNoteUpdate,
        channel,
        note,
        velocity,
        on: velocity > 0,
    })
}

interface ExternalCCUpdate {
    type: EventBusConsumerMessageType.ExternalCCUpdate,
    //id: string,
    channel: number,
    cc: number,
    value: number
}

export function sendUpdateExternalCCWidget(channel: number, cc: number, value: number) {
    sendEventToWorker(ebWorker, {
        type: EventBusConsumerMessageType.ExternalCCUpdate,
        channel,
        cc,
        value
    })
}

interface RegisterNoteWidget {
    type: EventBusConsumerMessageType.RegisterNoteWidget,
    id: string,
    channel: number, note: number
}

export function sendRegisterNoteWidget(id: string, channel: number, note: number) {
    sendEventToWorker(ebWorker, {
        type: EventBusConsumerMessageType.RegisterNoteWidget,
        id,
        channel,
        note
    })
}

interface UnregisterNoteWidget {
    type: EventBusConsumerMessageType.UnregisterNoteWidget,
    id: string
    channel: number,
    note: number
}

export function sendUnregisterNoteWidget(id: string, channel: number, note: number) {
    sendEventToWorker(ebWorker, {
        type: EventBusConsumerMessageType.UnregisterNoteWidget,
        id,
        channel,
        note
    })
}

interface UpdateCCValue {
    type: EventBusConsumerMessageType.UpdateCCValue,
    cc: number,
    channel: number,
    value: number
}

export function sendUpdateCCValue(channel: number, cc: number, value: number) {
    sendEventToWorker(ebWorker, {
        type: EventBusConsumerMessageType.UpdateCCValue,
        cc,
        channel,
        value
    })
}

export enum JogDirection {
    Forward = 65,
    Backward = 63
}

interface UpdateJogValue extends UpdateCCValue {
    value: JogDirection
}

export function sendUpdateJogValue(channel: number, cc: number, value: JogDirection) {
    sendEventToWorker(ebWorker, {
        type: EventBusConsumerMessageType.UpdateCCValue,
        cc,
        channel,
        value
    })
}


type EventBusCallback = (value: number) => void;

const callbacks = new Map<string, EventBusCallback>();

function EventBusDistributeUpdatesToMatrix(ebWorker: Worker) {
    ebWorker.addEventListener("message", (ev) => {
        const msg: EventBusProducerMessage = JSON.parse(ev.data);
        switch (msg.type) {
            //            case EventBusProducerMessageType.RegisterCCCallback:
            //                console.log("register cc callback")
            case EventBusProducerMessageType.CCUpdate:
                {
                    //console.log("event bus", "cc update", msg);
                    //const cb = callbacks.get(msg.id)!;
                    //cb(msg.value)
                    //EventBusDistributeUpdatesToMatrix(msg.id, msg.value);
                    const cb = callbacks.get(msg.id)!;
                    cb(msg.value)
                }
                break;
            //                    case EventBusProducerMessageType.RegisterNoteCallback:  // fallthrough
            //                console.log("register note callback")
            case EventBusProducerMessageType.NoteUpdate:
                {
                    //console.log("event bus", "note update", msg);
                    //const cb = callbacks.get(msg.id)!;
                    //cb(msg.velocity);
                    //EventBusDistributeUpdatesToMatrix(msg.id, msg.velocity);
                    const cb = callbacks.get(msg.id)!;
                    cb(msg.velocity)
                }
                break;
        }
    })
}

let ebWorker: Worker | null = null
export function initEventBusWorker(): Promise<Worker> {
    if (ebWorker !== null) throw new Error("the event bus is already running");

    ebWorker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });


    const p = new Promise<Worker>((res, rej) => {

        const fn = (ev: any) => {
            const msg: EventBusProducerMessage = JSON.parse(ev.data);
            switch (msg.type) {
                case EventBusProducerMessageType.EventBusInitCallback:
                    ebWorker?.removeEventListener("message", fn);
                    res(ebWorker!);
                    break;
            }
        }
        ebWorker?.addEventListener("message", fn);
    });

    p.then(worker => {
        EventBusDistributeUpdatesToMatrix(worker);
    });

    sendInitBus();

    return p;
}

export function registerCCConsumer(options: CCProperties & MidiProperties, consumer: EventBusConsumer): Promise<string> {
    return registerCCWidgetOnBus(options.channel, options.cc, options.default_value ?? 0, consumer.updateValue)
    /*.then(id => {
        //state.id = id
        consumer.consumerId = id;
    });*/
}

export function registerCCWidgetOnBus(channel: number, cc: number, init: number, cb: EventBusCallback): Promise<string> {
    if (!ebWorker) throw new Error("no event bus running");
    const id = uuid();

    return new Promise((res, rej) => {
        const fn = (ev: any) => {
            const msg: EventBusProducerMessage = JSON.parse(ev.data);
            if (msg.type === EventBusProducerMessageType.RegisterCCCallback && msg.id === id) {
                callbacks.set(id, cb);
                ebWorker?.removeEventListener("message", fn);
                res(id);
            }
        }
        ebWorker?.addEventListener("message", fn)
        sendRegisterCCWidget(id, channel, cc, init)
    });
}

export function unregisterCCConsumer(options: CCProperties & MidiProperties, consumer: EventBusConsumer): Promise<void> {
    if (!consumer.consumerId) throw new Error("consumer has no Id")
    return unregisterCCWidget(consumer.consumerId, options.channel, options.cc);
}

export function unregisterCCWidget(id: string, channel: number, cc: number): Promise<void> {
    if (!ebWorker) throw new Error("no event bus running");

    return new Promise((res, rej) => {
        const fn = (ev: any) => {
            const msg: EventBusProducerMessage = JSON.parse(ev.data);
            if (msg.type === EventBusProducerMessageType.UnregisterCCCallback && msg.id === id) {
                callbacks.delete(id);
                ebWorker?.removeEventListener("message", fn);
                res();
            }
        }
        ebWorker?.addEventListener("message", fn)
        sendUnregisterCCWidget(id, channel, cc)
    });
}

export function registerNoteWidget(channel: number, note: number, cb: EventBusCallback): Promise<string> {
    if (!ebWorker) throw new Error("no event bus running");
    const id = uuid();

    return new Promise((res, rej) => {
        const fn = (ev: any) => {
            const msg: EventBusProducerMessage = JSON.parse(ev.data);
            if (msg.type === EventBusProducerMessageType.RegisterNoteCallback && msg.id === id) {
                callbacks.set(id, cb);
                ebWorker?.removeEventListener("message", fn);
                res(id);
            }
        }
        ebWorker?.addEventListener("message", fn)
        sendRegisterNoteWidget(id, channel, note);
    });
}

export function unregisterNoteWidget(id: string, channel: number, note: number): Promise<void> {
    if (!ebWorker) throw new Error("no event bus running");

    return new Promise((res, rej) => {
        const fn = (ev: any) => {
            const msg: EventBusProducerMessage = JSON.parse(ev.data);
            if (msg.type === EventBusProducerMessageType.UnregisterNoteCallback && msg.id === id) {
                callbacks.delete(id);
                ebWorker?.removeEventListener("message", fn);
                res();
            }
        }
        ebWorker?.addEventListener("message", fn)
        sendUnregisterNoteWidget(id, channel, note)
    });
}

