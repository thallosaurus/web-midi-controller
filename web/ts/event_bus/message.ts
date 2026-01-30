interface EventBusProperties {
    midi_channels: number
}

// MARK: - Consumer/Client
function dispatchWorkerEvent(msg: EventBusProducerMessage) {
    self.postMessage(JSON.stringify(msg));
}

function sendEventToWorker(worker: Worker, msg: EventBusConsumerMessage) {
    worker.postMessage(msg)
}

export enum EventBusConsumerMessageType {
    InitBus = "init_bus",
    RegisterCCWidget = "register_cc_widget",
    UnregisterCCWidget = "unregister_cc_widget",
    RegisterNoteWidget = "register_note_widget",
    UnregisterNoteWidget = "unregister_note_widget"
}

export type EventBusConsumerMessage =
    | InitBus
    | RegisterCCWidget
    | UnregisterCCWidget
    | RegisterNoteWidget
    | UnregisterNoteWidget

interface InitBus extends EventBusProperties {
    type: EventBusConsumerMessageType.InitBus,
}

export function sendInitBus(worker: Worker, midi_channels = 16) {
    sendEventToWorker(worker, {
        type: EventBusConsumerMessageType.InitBus,
        midi_channels
    })
}

interface RegisterCCWidget {
    type: EventBusConsumerMessageType.RegisterCCWidget,
    id: string,
    channel: number,
    cc: number,
    value?: number
}

export function sendRegisterCCWidget(worker: Worker, id: string, channel: number, cc: number, value?: number) {
    sendEventToWorker(worker, {
        type: EventBusConsumerMessageType.RegisterCCWidget,
        id,
        channel,
        cc,
        value
    })
}

interface UnregisterCCWidget {
    type: EventBusConsumerMessageType.UnregisterCCWidget,
    id: string,
    channel: number,
    cc: number
}

export function sendUnregisterCCWidget(worker: Worker, id: string, channel: number, cc: number) {
    sendEventToWorker(worker, {
        type: EventBusConsumerMessageType.UnregisterCCWidget,
        id,
        channel,
        cc,
    })
}

interface RegisterNoteWidget {
    type: EventBusConsumerMessageType.RegisterNoteWidget,
    id: string,
    channel: number, note: number
}

export function sendRegisterNoteWidget(worker: Worker, id: string, channel: number, note: number) {
    sendEventToWorker(worker, {
        type: EventBusConsumerMessageType.RegisterNoteWidget,
        id,
        channel,
        note
    })
}

interface UnregisterNoteWidget {
    type: EventBusConsumerMessageType.UnregisterNoteWidget,
    id: string
    channel: number,
    note: number
}

export function sendUnregisterNoteWidget(worker: Worker, id: string, channel: number, note: number) {
    sendEventToWorker(worker, {
        type: EventBusConsumerMessageType.UnregisterNoteWidget,
        id,
        channel,
        note
    })
}


// MARK: - Producer

export enum EventBusProducerMessageType {
    EventBusInitCallback = "init_bus_callback",
    CCUpdate = "cc_update",
    NoteUpdate = "note_update",
    RegisterCCCallback = "register_cc_callback",
    RegisterNoteCallback = "register_note_callback",
    UnregisterCCCallback = "unregister_cc_callback",
    UnregisterNoteCallback = "unregister_note_callback"
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
    channel: number
}

export function sendInitCCWidget(id: string, channel: number, cc: number, value: number) {
    dispatchWorkerEvent({
        type: EventBusProducerMessageType.RegisterCCCallback,
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
    channel: number
}

export function sendUpdateCCWidget(id: string, channel: number, cc: number, value: number) {
    dispatchWorkerEvent({
        type: EventBusProducerMessageType.CCUpdate,
        id,
        value,
        cc,
        channel
    })
}

interface RegisterNoteCallback {
    type: EventBusProducerMessageType.RegisterNoteCallback,
    id: string,
    channel: number,
    note: number,
    value?: number
}

export function sendInitNoteWidget(id: string, channel: number, note: number, value?: number) {
    dispatchWorkerEvent({
        type: EventBusProducerMessageType.RegisterNoteCallback,
        id,
        note,
        value,
        channel
    })
}

interface NoteUpdate {
    type: EventBusProducerMessageType.NoteUpdate,
    id: string,
    channel: number,
    note: number,
    value: number
}

export function sendUpdateNoteWidget(id: string, channel: number, note: number, value: number) {
    dispatchWorkerEvent({
        type: EventBusProducerMessageType.NoteUpdate,
        id,
        note,
        value,
        channel
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