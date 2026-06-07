export interface ConnectedPayload {
    type: "connection",
    id: string
}

export interface NoteMessagePayload {
    type: "note",
    channel: number,
    note: number,
    velocity: number,
    on: boolean
}

export interface CCMessagePayload {
    type: "cc",
    channel: number,
    cc: number,
    value: number
}

export type AllowedPayloads = CCMessagePayload | NoteMessagePayload | ConnectedPayload;
