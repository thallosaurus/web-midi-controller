import type { MidiEvent } from "../common/events";
import { connect, disconnect, send, wsUri } from "./websocket";

export enum WorkerMessageType {
    Connect = "connect",
    Disconnect = "disconnect",
    Connected = "connected",
    Disconnected = "disconnected",
    ConnectError = "connect_error",
    MidiFrontendInput = "midi_frontend_input",
    MidiExternalInput = "midi_external_input",
    WorkerError = "worker_error"
}

export type WorkerMessage =
    | ConnectSocketMessage
    | DisconnectSocketMessage
    | ConnectErrorMessage
    | ConnectedMessage
    | DisconnectedMessage
    | WorkerErrorMessage
    | MidiExternalInput
    | SurfaceMidiEvent;

/**
 * Send this from the frontend if you want to connect
 */
interface ConnectSocketMessage {
    type: WorkerMessageType.Connect,
    uri: string
}

interface WorkerErrorMessage {
    type: WorkerMessageType.WorkerError,
    error: Error
}

interface ConnectErrorMessage {
    type: WorkerMessageType.ConnectError,
    error: Error
}

/**
 * Send this from the frontend if you want to disconnect
 */
interface DisconnectSocketMessage {
    type: WorkerMessageType.Disconnect
}

export interface ConnectedMessage {
    type: WorkerMessageType.Connected,
    overlay_path: string
}

interface DisconnectedMessage {
    type: WorkerMessageType.Disconnected
    error?: string
}

interface SurfaceMidiEvent {
    type: WorkerMessageType.MidiFrontendInput
    data: MidiEvent
}

interface MidiExternalInput {
    type: WorkerMessageType.MidiExternalInput
    data: MidiEvent
}

// Send message back to the frontend
function sendMessage(m: WorkerMessage) {
    const msg = JSON.stringify(m)
    self.postMessage(msg);
}

function sendMessageInput(worker: Worker, m: WorkerMessage) {
    //console.log(m);
    const msg = JSON.stringify(m)
    worker.postMessage(msg);
}

export function process_worker_input(msg: WorkerMessage) {
        switch (msg.type) {
        case WorkerMessageType.Connect:
            {
                let n = msg as ConnectSocketMessage;
                connect(n.uri).then(s => {
                    // connection established
                    sendDefaultConnected();
                    
                }).catch(e => {
                    // there was an error
                    //console.error(e);
                    sendWorkerError(e);
                });
            }
            break;

        case WorkerMessageType.MidiFrontendInput:
            console.log("data for the backend", msg.data)
            const d = JSON.stringify(msg.data)
            send(d);
            break;

        case WorkerMessageType.Disconnect:
            disconnect().then(e => {
                sendDisconnected(new Error("user disconnected"));
            });
            break;
    }
}

/// MARK: - shorthands for message passing
export function sendWorkerError(error: Error) {
    sendMessage({
        type: WorkerMessageType.WorkerError,
        error
    })
}
export const overlayUri = "http://" + location.hostname + ":8888/overlays";
export function sendDefaultConnected() {
    sendConnected(overlayUri)
}
export function sendConnected(overlay_path: string) {
    sendMessage({
        type: WorkerMessageType.Connected,
        overlay_path
    })
}

export function sendDisconnected(error: Error) {
    sendMessage({
        type: WorkerMessageType.Disconnected,
        error: error.message
    })
}

export function connectSocketMessage(worker: Worker, uri = wsUri) {
    sendMessageInput(worker, {
        type: WorkerMessageType.Connect,
        uri
    });
}

export function disconnectSocketMessage(worker: Worker) {
    sendMessageInput(worker, {
        type: WorkerMessageType.Disconnect
    });
}
/**
 * Use this function to send midi messages from the websocket to the parent thread
 * @param data 
 */
export function sendMidiEvent(data: MidiEvent) {
    sendMessage({
        type: WorkerMessageType.MidiFrontendInput,
        data
    })
}
/***
 * Sane as sendMidiEvent, but from the main thread - dont get them mixed up
 * @param worker 
 * @param data 
 */
export function sendFrontendMidiEvent(ws: Worker, data: MidiEvent) {
    console.debug("websocket client", "sendFrontendMidiEvent", data)
    sendMessageInput(ws, {
        type: WorkerMessageType.MidiFrontendInput,
        data
    })
}