// MARK: - Producer
function dispatchWorkerEvent(msg: EventBusProducerMessage) {
    self.postMessage(JSON.stringify(msg));
}

/**
 * Messages that go OUT from the Event Bus
 */
export enum EventBusProducerMessageType {
    EventBusInitCallback = "init_bus_callback",
    CCUpdate = "cc_update",
    NoteUpdate = "note_update",
    RegisterCCCallback = "register_cc_callback",
    RegisterNoteCallback = "register_note_callback",
    UnregisterCCCallback = "unregister_cc_callback",
    UnregisterNoteCallback = "unregister_note_callback",
}

export type EventBusProducerMessage =
    | EventBusInitCallback
    | CCUpdate
    | NoteUpdate
    | RegisterCCCallback
    | UnregisterCCCallback
    | RegisterNoteCallback
    | UnregisterNoteCallback

interface EventBusInitCallback {
    type: EventBusProducerMessageType.EventBusInitCallback
}

export function sendEventBusInitCallback() {
    dispatchWorkerEvent({
        type: EventBusProducerMessageType.EventBusInitCallback
    })
}

interface RegisterCCCallback {
    type: EventBusProducerMessageType.RegisterCCCallback,
    id: string,
    value: number,
    cc: number
    channel: number,
    ext: boolean
}

export function sendInitCCWidget(id: string, channel: number, cc: number, value: number) {
    dispatchWorkerEvent({
        type: EventBusProducerMessageType.RegisterCCCallback,
        ext: true,
        id,
        value,
        cc,
        channel
    })
}

interface UnregisterCCCallback {
    type: EventBusProducerMessageType.UnregisterCCCallback
    id: string
}

export function sendUnregisterCCCallback(id: string) {
    dispatchWorkerEvent({
        type: EventBusProducerMessageType.UnregisterCCCallback,
        id
    })
}

interface CCUpdate {
    type: EventBusProducerMessageType.CCUpdate,
    id: string,
    value: number,
    cc: number
    channel: number,
    ext: boolean
}

export function sendUpdateCCWidget(id: string, channel: number, cc: number, value: number, ext: boolean) {
    dispatchWorkerEvent({
        type: EventBusProducerMessageType.CCUpdate,
        id,
        value,
        cc,
        channel,
        ext
    })
}

interface RegisterNoteCallback {
    type: EventBusProducerMessageType.RegisterNoteCallback,
    id: string,
    channel: number,
    note: number,
    //value: number,
    velocity: number,
    ext: boolean
}

export function sendInitNoteWidget(id: string, channel: number, note: number, velocity: number) {
    dispatchWorkerEvent({
        type: EventBusProducerMessageType.RegisterNoteCallback,
        ext: true,
        id,
        note,
        velocity,
        channel
    })
}

interface NoteUpdate {
    type: EventBusProducerMessageType.NoteUpdate,
    id: string,
    channel: number,
    note: number,
    velocity: number,
    ext: boolean
}

export function sendUpdateNoteWidget(id: string, channel: number, note: number, velocity: number, ext: boolean) {
    dispatchWorkerEvent({
        type: EventBusProducerMessageType.NoteUpdate,
        id,
        note,
        velocity,
        channel,
        ext
    })
}

interface UnregisterNoteCallback {
    type: EventBusProducerMessageType.UnregisterNoteCallback
    id: string
}

export function sendUnregisterNoteCallback(id: string) {
    dispatchWorkerEvent({
        type: EventBusProducerMessageType.UnregisterCCCallback,
        id
    })
}