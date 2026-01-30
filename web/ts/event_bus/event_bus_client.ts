import { uuid } from "../common/utils";
import { EventBusProducerMessage, EventBusProducerMessageType } from "./message";

interface EventBusProperties {
    midi_channels: number
}

// MARK: - Consumer/Client


function sendEventToWorker(worker: Worker | null, msg: EventBusConsumerMessage) {
    if (!worker) throw new Error ("cant send on a null event bus")
    worker.postMessage(msg)
}

export enum EventBusConsumerMessageType {
    InitBus = "init_bus",
    RegisterCCWidget = "register_cc_widget",
    UnregisterCCWidget = "unregister_cc_widget",
    RegisterNoteWidget = "register_note_widget",
    UnregisterNoteWidget = "unregister_note_widget",
    UpdateCCValue = "update_cc_value",
    UpdateNoteValue = "update_note_value"
}

export type EventBusConsumerMessage =
    | InitBus
    | UpdateCCValue
    | UpdateJogValue
    | RegisterCCWidget
    | UnregisterCCWidget
    | UpdateNoteValue
    | RegisterNoteWidget
    | UnregisterNoteWidget

interface InitBus extends EventBusProperties {
    type: EventBusConsumerMessageType.InitBus,
}

export function sendInitBus(worker: Worker | null, midi_channels = 16) {
    sendEventToWorker(worker, {
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

export function sendRegisterCCWidget(worker: Worker | null, id: string, channel: number, cc: number, value: number) {
    sendEventToWorker(worker, {
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

export function sendUnregisterCCWidget(worker: Worker | null, id: string, channel: number, cc: number) {
    sendEventToWorker(worker, {
        type: EventBusConsumerMessageType.UnregisterCCWidget,
        id,
        channel,
        cc,
    })
}

interface UpdateNoteValue {
    type: EventBusConsumerMessageType.UpdateNoteValue,
    channel: number, note: number, velocity: number, on: boolean
}

export function sendUpdateNoteValue(worker: Worker | null, channel: number, note: number, velocity: number, on: boolean) {
    sendEventToWorker(worker, {
        type: EventBusConsumerMessageType.UpdateNoteValue,
        channel,
        note,
        velocity,
        on
    })
}

interface RegisterNoteWidget {
    type: EventBusConsumerMessageType.RegisterNoteWidget,
    id: string,
    channel: number, note: number
}

export function sendRegisterNoteWidget(worker: Worker | null, id: string, channel: number, note: number) {
    sendEventToWorker(worker, {
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

export function sendUnregisterNoteWidget(worker: Worker | null, id: string, channel: number, note: number) {
    sendEventToWorker(worker, {
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

export function sendUpdateCCValue(worker: Worker | null, channel: number, cc: number, value: number) {
    sendEventToWorker(worker, {
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

export function sendUpdateJogValue(worker: Worker | null, channel: number, cc: number, value: JogDirection) {
    sendEventToWorker(worker, {
        type: EventBusConsumerMessageType.UpdateCCValue,
        cc,
        channel,
        value
    })
}


type EventBusCallback = (value: number) => void;

const callbacks = new Map<string, EventBusCallback>();

export let ebWorker: Worker | null = null
export function initEventBusWorker(): Promise<Worker> {
    if (ebWorker !== null) throw new Error("the event bus is already running");

    ebWorker = new Worker(new URL("./main.js", import.meta.url), { type: "module" });
    ebWorker.addEventListener("message", (ev) => {
        const msg: EventBusProducerMessage = JSON.parse(ev.data);
        switch (msg.type) {
            case EventBusProducerMessageType.CCUpdate:
                {
                    console.log("cc update", msg);
                    const cb = callbacks.get(msg.id)!;
                    cb(msg.value)
                }
                break;
                case EventBusProducerMessageType.NoteUpdate:
                    {
                    console.log("note update", msg);
                    const cb = callbacks.get(msg.id)!;
                    cb(msg.value);
                }
                break;
        }
    })

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

    sendInitBus(ebWorker!);

    return p;
}

export function registerCCWidget(channel: number, cc: number, init: number, cb: EventBusCallback): Promise<string> {
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
        sendRegisterCCWidget(ebWorker!, id, channel, cc, init)
    });
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
        sendUnregisterCCWidget(ebWorker!, id, channel, cc)
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
        sendRegisterNoteWidget(ebWorker!, id, channel, note);
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
        sendUnregisterNoteWidget(ebWorker!, id, channel, note)
    });
}

