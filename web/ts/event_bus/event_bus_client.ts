import { uuid } from "../common/utils";
import { EventBusProducerMessage, EventBusProducerMessageType, sendRegisterCCWidget, sendRegisterNoteWidget, sendUnregisterCCWidget } from "./message";

type EventBusCallback = (value: number) => void;

const callbacks = new Map<string, EventBusCallback>();

export let ebWorker: Worker | null = null
export function initEventBusWorker() {
    if (ebWorker !== null) throw new Error("the event bus is already running");

    ebWorker = new Worker(new URL("./main.js", import.meta.url), { type: "module" });
    ebWorker.addEventListener("message", (ev) => {
        const msg: EventBusProducerMessage = JSON.parse(ev.data);
        console.log(msg);
        switch (msg.type) {
            case EventBusProducerMessageType.CCUpdate:
                {
                    const cb = callbacks.get(msg.id)!;
                    cb(msg.value)
                }
                break;
            case EventBusProducerMessageType.NoteUpdate:
                {
                    const cb = callbacks.get(msg.id)!;
                    cb(msg.value);
                }
                break;
        }
    })
}

function registerCCWidget(channel: number, cc: number, init: number, cb: EventBusCallback): Promise<string> {
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
function unregisterCCWidget(id: string, channel: number, cc: number): Promise<void> {
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

function registerNoteWidget(channel: number, note: number, cb: EventBusCallback): Promise<string> {
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

function unregisterNoteWidget(id: string, channel: number, note: number): Promise<void> {
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
        //sendUnregisterNoteWidget(ebWorker!, id, channel, cc)
    });
}