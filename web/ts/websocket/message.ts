import type { MidiEvent } from "../events";
import { wsUri } from "./websocket";

export enum WorkerMessageType {
    Connect = "connect",
    Disconnect = "disconnect",
    Connected = "connected",
    Disconnected = "disconnected",
    DataTest = "data",
    ConnectError = "connect_error",
    MidiFrontendInput = "midi_frontend_input"
}

export type WorkerMessage =
    | ConnectSocketMessage
    | DisconnectSocketMessage
    | ConnectedMessage
    | DisconnectedMessage
    | SurfaceMidiEvent;

/**
 * Send this from the frontend if you want to connect
 */
interface ConnectSocketMessage {
    type: WorkerMessageType.Connect,
    uri: string
}

/**
 * Send this from the frontend if you want to disconnect
 */
interface DisconnectSocketMessage {
    type: WorkerMessageType.Disconnect
}

interface ConnectedMessage {
    type: WorkerMessageType.Connected
}

interface DisconnectedMessage {
    type: WorkerMessageType.Disconnected
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

/// MARK: - shorthands for message passing

export function sendConnected() {
    sendMessage({
        type: WorkerMessageType.Connected
    })
}

export function sendDisconnected() {
    sendMessage({
        type: WorkerMessageType.Disconnected
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