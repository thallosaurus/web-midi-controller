import type { MidiEvent } from "../events";
import { connect, disconnect, send, wsUri } from "./websocket";

export enum WorkerMessageType {
    Connect = "connect",
    Disconnect = "disconnect",
    Connected = "connected",
    Disconnected = "disconnected",
    DataTest = "data",
    ConnectError = "connect_error",
    MidiFrontendInput = "midi_frontend_input",
    WorkerError = "worker_error"
}

export type WorkerMessage =
    | ConnectSocketMessage
    | DisconnectSocketMessage
    | ConnectErrorMessage
    | ConnectedMessage
    | DisconnectedMessage
    | WorkerErrorMessage
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

// Send message back to the frontend
function sendMessage(m: WorkerMessage) {
    const msg = JSON.stringify(m)
    self.postMessage(msg);
}

function sendMessageInput(worker: Worker, m: WorkerMessage) {
    const msg = JSON.stringify(m)
    worker.postMessage(msg);
}

export function process_worker_message(msg: WorkerMessage) {
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

                // connect to websocket
                //connect(wsUri, (socket) => {
                    // Setup Websocket async with Handler for backend events
                    //setupSocketAsync(socket);



                /*}).then(e => {
                    sendConnected();
                    //self.postMessage("connected from worker");
                }).catch(e => {
                    sendDisconnected();
                })*/

            }
            break;

        case WorkerMessageType.MidiFrontendInput:
            //console.log("data for the frontend")
            send(JSON.stringify(msg.data));
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
 * Send Midi Events to the caller
 * @param data 
 */
export function sendMidiEvent(data: MidiEvent) {
    sendMessage({
        type: WorkerMessageType.MidiFrontendInput,
        data
    })
}
export function sendFrontendMidiEvent(worker: Worker, data: MidiEvent) {
    sendMessageInput(worker, {
        type: WorkerMessageType.MidiFrontendInput,
        data
    })
}