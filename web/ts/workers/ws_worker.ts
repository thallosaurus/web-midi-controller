import { connect, disconnect, send } from "../websocket.ts";
import { sendConnected, sendDisconnected, sendFrontendMidiEvent } from "./message.ts";
import websocketWorkerUrl from './ws_worker?worker&url';
import { WorkerMessageType, connectSocketMessage } from './message';
import type { MidiEvent } from "../events.ts";

// We got a message
onmessage = (m) => {
    const msg = JSON.parse(m.data);
    console.log("worker got a message", msg);

    switch (msg.type) {
        case WorkerMessageType.Connect:
            {
                // connect to websocket
                connect().then(e => {
                    sendConnected();
                    //self.postMessage("connected from worker");
                }).catch(e => {
                    sendDisconnected();
                })

            }
            break;

        case WorkerMessageType.MidiFrontendInput:
            send(JSON.stringify(msg.data));
            break;
    }

    if (msg.type == WorkerMessageType.Connect) {

    }

}

let wsWorker: Worker | null = null;
export function init_websocket_worker(): Promise<boolean> {
    return new Promise((res, rej) => {

        const worker = new Worker(websocketWorkerUrl, { type: 'module' })
        connectSocketMessage(worker);
        worker.onmessage = (ev) => {
            const msg = JSON.parse(ev.data);
            console.log("worker message", msg);
            if (msg.type == "connected") {
                wsWorker = worker;
                res(true);
            };
            if (msg.type == "connect_error") {
                rej(false);
            }
        };
    })
}

export function FrontendSocketEvent(ev: MidiEvent) {
    if (wsWorker != null) {
        sendFrontendMidiEvent(wsWorker, ev);
    }
}