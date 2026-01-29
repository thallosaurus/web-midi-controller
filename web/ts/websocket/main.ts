import { connect, disconnect, send, setupSocketAsync, wsUri } from "./websocket.ts";
import { disconnectSocketMessage, sendConnected, sendDisconnected, sendFrontendMidiEvent, sendMidiEvent } from "./message.ts";
//import websocketWorkerUrl from './?worker&url';
import { WorkerMessageType, connectSocketMessage } from './message.ts';
import type { MidiEvent } from "../events.ts";
import { process_external } from "../event_bus.ts";

// Worker got a message
onmessage = (m) => {
    const msg = JSON.parse(m.data);
    //console.log("worker got a message", msg);

    switch (msg.type) {
        case WorkerMessageType.Connect:
            {
                // connect to websocket
                connect(wsUri, (socket) => {
                    // Setup Websocket async with Handler for backend events
                    setupSocketAsync(socket);
                }).then(e => {
                    sendConnected();
                    //self.postMessage("connected from worker");
                }).catch(e => {
                    sendDisconnected();
                })

            }
            break;

        case WorkerMessageType.MidiFrontendInput:
            //console.log("data for the frontend")
            send(JSON.stringify(msg.data));
            break;

        case WorkerMessageType.Disconnect:
            disconnect();
            break;
    }
}

// Runs in another thread
export let wsWorker: Worker | null = null;
type WorkerEventHandler = (msg: MidiEvent) => void;
export function init_websocket_worker(event_handler: WorkerEventHandler): Promise<boolean> {
    return new Promise((res, rej) => {

        const worker = new Worker(import.meta.url, { type: 'module' })
        connectSocketMessage(worker);
        worker.addEventListener("message", ev => {
            const msg = JSON.parse(ev.data);
            event_handler(msg);
        })

        // functions for the 
        worker.onmessage = (ev) => {
            const msg = JSON.parse(ev.data);
            //console.log("worker message", msg);
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

export function DisconnectSocketEvent() {
    if (wsWorker != null) {
        disconnectSocketMessage(wsWorker);
    } else {
        console.error("wsWorker was null", wsWorker);
    }
}
