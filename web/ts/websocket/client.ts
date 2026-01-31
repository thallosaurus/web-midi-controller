//import { connect, disconnect, send, wsUri } from "./websocket.ts";
import { disconnectSocketMessage, sendFrontendMidiEvent, type ConnectedMessage, type WorkerMessage, WorkerMessageType, connectSocketMessage } from "./message";
import { MidiEvent } from "../common/events.ts";

// should run in another thread
export let wsWorker: Worker | null = null;
export let lastError: Error | null;
export function initWebsocketWorker(): Worker {
    //if (wsWorker !== null) throw new Error("the websocket thread is already running")
    let w = new Worker(new URL("./worker.js", import.meta.url), { type: 'module' })
    ConnectWebsocketWorkerWithHandler(w);
    return w
}

// we need to call it somewhere

export function ConnectWebsocketWorkerWithHandler(worker: Worker) {
    return new Promise<ConnectedMessage>((res, rej) => {

        worker.addEventListener("message", (ev) => {
            const msg: WorkerMessage = JSON.parse(ev.data);
            //console.log("worker message", msg);

            switch (msg.type) {
                case WorkerMessageType.Connected:
                    console.log("main -", "worker connection successful", msg)
                    wsWorker = worker;
                    res(msg);
                    break;

                case WorkerMessageType.ConnectError:
                    console.log("main", msg);
                    rej(msg.error)
                    lastError = msg.error;
                    break;

                case WorkerMessageType.Disconnected:
                    wsWorker = null;
                    console.log("initWebsocketWorker", "disconnected")
                    rej("server disconnected while connecting - no reason idk")
                    break;
            }
        });
        connectSocketMessage(worker);
    })
}

export function FrontendSocketEvent(ev: MidiEvent) {
    if (wsWorker != null) {
        sendFrontendMidiEvent(wsWorker, ev);
    } else {
        throw new Error("wsWorker was null");
    }
}

export function DisconnectSocketEvent() {
    if (wsWorker != null) {
        disconnectSocketMessage(wsWorker);
    } else {
        throw new Error("wsWorker was null");
    }
}

export function ConnectSocketEvent(ws: Worker) {
    if (wsWorker != null) {
        connectSocketMessage(ws);
    } else {
        throw new Error("wsWorker was null");
    }
}