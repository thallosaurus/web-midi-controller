import type { MidiEvent } from "../common/events";
import { ConnectSocketMessage, SocketWorkerRequest, SocketWorkerRequestType } from "./client";
import { connect, disconnect, send } from "./websocket";

/**
 * process messages from the frontend/the calling thread
 * @param msg 
 */
export function process_worker_input(msg: SocketWorkerRequest) {
        switch (msg.type) {
        case SocketWorkerRequestType.Connect:
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

        case SocketWorkerRequestType.MidiFrontendInput:
            //console.log("data for the backend", msg.data)
            const d = JSON.stringify(msg.data)
            send(d);
            break;

        case SocketWorkerRequestType.Disconnect:
            disconnect().then(e => {
                sendDisconnected(new Error("user disconnected"));
            });
            break;
    }
}

/**
 * Messages, that were sent from the worker to the calling thread
 */
export enum SocketWorkerResponse {
    Connected = "connected",
    Disconnected = "disconnected",
    ConnectError = "connect_error",
    MidiFrontendInput = "midi_frontend_input",
    MidiExternalInput = "midi_external_input",
    WorkerError = "worker_error"
}

export type SocketWorkerResponseType =
    | ConnectErrorMessage
    | ConnectedMessage
    | DisconnectedMessage
    | WorkerErrorMessage
    | MidiExternalInput
    | SurfaceMidiEvent;

interface WorkerErrorMessage {
    type: SocketWorkerResponse.WorkerError,
    error: Error
}

interface ConnectErrorMessage {
    type: SocketWorkerResponse.ConnectError,
    error: Error
}

export interface ConnectedMessage {
    type: SocketWorkerResponse.Connected,
    overlay_path: string
}

interface DisconnectedMessage {
    type: SocketWorkerResponse.Disconnected
    error?: string
}

interface SurfaceMidiEvent {
    type: SocketWorkerResponse.MidiFrontendInput
    data: MidiEvent
}

interface MidiExternalInput {
    type: SocketWorkerResponse.MidiExternalInput
    data: MidiEvent
}

// Send message back to the frontend
function sendMessage(m: SocketWorkerResponseType) {
    const msg = JSON.stringify(m)
    self.postMessage(msg);
}

/// MARK: - shorthands for message passing
export function sendWorkerError(error: Error) {
    sendMessage({
        type: SocketWorkerResponse.WorkerError,
        error
    })
}
export const overlayUri = "http://" + location.hostname + ":8888/overlays";
export function sendDefaultConnected() {
    sendConnected(overlayUri)
}
export function sendConnected(overlay_path: string) {
    sendMessage({
        type: SocketWorkerResponse.Connected,
        overlay_path
    })
}

export function sendDisconnected(error: Error) {
    sendMessage({
        type: SocketWorkerResponse.Disconnected,
        error: error.message
    })
}




/**
 * Use this function to send midi messages from the websocket to the parent thread
 * @param data 
 */
export function sendMidiEvent(data: MidiEvent) {
    sendMessage({
        type: SocketWorkerResponse.MidiFrontendInput,
        data
    })
}
