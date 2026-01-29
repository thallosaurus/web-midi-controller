import type { MidiEvent } from "../events";
import { wsUri } from "../websocket";

export enum WorkerMessageType {
    Connect = "connect",
    Connected = "connected",
    Disconnected = "disconnected",
    DataTest = "data",
    ConnectError = "connect_error",
    MidiFrontendInput = "midi_frontend_input"
}

export type WorkerMessage =
    | ConnectSocketMessage
    | ConnectedMessage
    | DisconnectedMessage
    | SurfaceMidiEvent;

interface ConnectSocketMessage {
    type: WorkerMessageType.Connect,
    uri: string
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
//interface WorkerMessageData {}


//export type ConnectedWorkerMessage = WorkerMessage<{}>;
//export type HeartbeatWorkerMessage = WorkerMessage<{}>;

// Send message back to the frontend
function sendMessage(m: WorkerMessage) {
    const msg = JSON.stringify(m)
    self.postMessage(msg);
}

function sendMessageInput(worker: Worker, m: WorkerMessage) {
        const msg = JSON.stringify(m)
    worker.postMessage(msg);
}

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

export function sendFrontendMidiEvent(worker: Worker, data: MidiEvent) {
    sendMessageInput(worker, {
        type: WorkerMessageType.MidiFrontendInput,
        data
    })
}