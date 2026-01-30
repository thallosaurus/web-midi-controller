import { uuid } from "../common/utils";
import { EventBusProducerMessage, EventBusProducerMessageType } from "./message";

export let ebWorker: Worker | null = null
export function initEventBusWorker() {
    if (ebWorker !== null) throw new Error("the event bus is already running");

    let worker = new Worker(new URL("./main.js", import.meta.url), { type: "module" });
    worker.addEventListener("message", (ev) => {
        const msg: EventBusProducerMessage = JSON.parse(ev.data);
        console.log(msg)
        /*switch (msg.type) {
            case EventBusProducerMessageType.CCUpdate:
            case EventBusProducerMessageType.NoteUpdate:
            case EventBusProducerMessageType.RegisterCCCallback:
            case EventBusProducerMessageType.RegisterNoteCallback:
            case EventBusProducerMessageType.UnregisterCCCallback:
        }*/
    })
}