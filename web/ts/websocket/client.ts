//import { connect, disconnect, send, wsUri } from "./websocket.ts";
import { type ConnectedMessage, SocketWorkerResponse, SocketWorkerResponseType } from "./message";
import { MidiEvent } from "../common/events.ts";
import { log } from "@common/logger.ts";
import { wsUri } from "./websocket.ts";

export enum SocketWorkerRequestType {
    Connect = "connect",
    Disconnect = "disconnect",
    MidiFrontendInput = "midi_frontend_input",
}

export type SocketWorkerRequest =
| ConnectSocketMessage
| DisconnectSocketMessage
| SurfaceMidiEvent

interface SurfaceMidiEvent {
    type: SocketWorkerRequestType.MidiFrontendInput
    data: MidiEvent
}
/**
 * Send this from the frontend if you want to connect
 */
export interface ConnectSocketMessage {
    type: SocketWorkerRequestType.Connect,
    uri: string
}

/**
 * Send this from the frontend if you want to disconnect
 */
interface DisconnectSocketMessage {
    type: SocketWorkerRequestType.Disconnect
}


// should run in another thread
//export let wsWorker: Worker | null = null;
export let lastError: Error | null;
export function initWebsocketWorker(): Worker {
    //if (wsWorker !== null) throw new Error("the websocket thread is already running")
    let w = new Worker(new URL("./worker.js", import.meta.url), { type: 'module' })
    //ConnectWebsocketWorkerWithHandler(w);
    return w
}

// we need to call it somewhere

export function ConnectWebsocketWorkerWithHandler(worker: Worker) {
    return new Promise<ConnectedMessage>((res, rej) => {

        const fn = (e: any) => {

            const msg: SocketWorkerResponseType = JSON.parse(e.data);
            //console.log("worker message", msg);

            switch (msg.type) {
                case SocketWorkerResponse.Connected:
                    debugger;
                    log("worker connection successful", msg)
                    //wsWorker = worker;
                    worker.removeEventListener("message", fn);
                    res(msg);
                    break;

                case SocketWorkerResponse.ConnectError:
                    log("connect error", msg);
                    worker.removeEventListener("message", fn);
                    rej(msg.error)
                    break;

                case SocketWorkerResponse.Disconnected:
                    //wsWorker = null;
                    log("disconnected")
                    worker.removeEventListener("message", fn);
                    rej("server disconnected while connecting - no reason idk")
                    break;
            }

        }
        worker.addEventListener("message", fn);

        // send this from the ui to connect the given socket to the uri
        //autoconnect?
        //connectSocketMessage(worker, wsUri);
    })
}

export function sendMessageInput(worker: Worker, m: SocketWorkerRequest) {
    //console.log(m);
    const msg = JSON.stringify(m)
    worker.postMessage(msg);
}

export function connectSocketMessage(worker: Worker, uri: string) {
    sendMessageInput(worker, {
        type: SocketWorkerRequestType.Connect,
        uri
    });
}

export function disconnectSocketMessage(worker: Worker) {
    sendMessageInput(worker, {
        type: SocketWorkerRequestType.Disconnect
    });
}

/***
 * Sane as sendMidiEvent, but from the main thread - dont get them mixed up
 * @param worker 
 * @param data 
 */
export function sendFrontendMidiEvent(ws: Worker, data: MidiEvent) {
    console.debug("websocket client", "sendFrontendMidiEvent", data)
    sendMessageInput(ws, {
        type: SocketWorkerRequestType.MidiFrontendInput,
        data
    })
}

//send this from the ui to connect the giveb socket to the uri
export function _ConnectSocketEvent(ws: Worker, uri: string) {
    if (ws != null) {
        connectSocketMessage(ws, uri);
    } else {
        throw new Error("wsWorker was null");
    }
}