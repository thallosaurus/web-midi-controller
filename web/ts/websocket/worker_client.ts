import { connect, disconnect, send, wsUri } from "./websocket.ts";
import { disconnectSocketMessage, process_worker_message, sendConnected, sendDisconnected, sendFrontendMidiEvent, sendMidiEvent, type ConnectedMessage, type WorkerMessage } from "./message.ts";
//import websocketWorkerUrl from './?worker&url';
import { WorkerMessageType, connectSocketMessage } from './message.ts';
import { MidiEvent } from "../events.ts";

// should run in another thread
export let wsWorker: Worker | null = null;
export async function initWebsocketWorker(): Promise<[Worker, ConnectedMessage]> {
    if (wsWorker !== null) throw new Error("the websocket thread is already running")

    let w = await new Promise<[Worker, ConnectedMessage]>((res, rej) => {

        let worker = new Worker(new URL("./main.js", import.meta.url), { type: 'module' })

        worker.addEventListener("message", (ev) => {
            const msg: WorkerMessage = JSON.parse(ev.data);
            //console.log("worker message", msg);

            switch (msg.type) {
                case WorkerMessageType.Connected:
                    console.log("main -", "worker connection successful", msg)
                    wsWorker = worker;
                    res([worker, msg]);
                    break;

                case WorkerMessageType.ConnectError:
                    console.log("main", msg);
                    rej(msg.error)
                    break;

                case WorkerMessageType.Disconnected:
                    wsWorker = null;
                    console.log("initWebsocketWorker", "disconnected")
                    rej()
                    break;
            }
        });
        connectSocketMessage(worker);
    });

    //send message to the worker so it connects to the given URI
    return w;
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

export function ConnectSocketEvent() {
    if (wsWorker != null) {
        connectSocketMessage(wsWorker);
    } else {
        throw new Error("wsWorker was null");
    }
}