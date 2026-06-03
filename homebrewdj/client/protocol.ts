export interface ConnectedPayload {
    type: "connection",
    id: string
}

interface NoteMessagePayload {
    type: "note",
    channel: number,
    note: number,
    velocity: number,
    on: boolean
}

interface CCMessagePayload {
    type: "cc",
    channel: number,
    cc: number,
    value: number
}

export type AllowedPayloads = CCMessagePayload | NoteMessagePayload | ConnectedPayload;
