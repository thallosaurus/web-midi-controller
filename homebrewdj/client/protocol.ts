export interface ConnectedPayload {
    type: "connection",
    id: string,
    clientNumber: number
}

export interface NoteMessagePayload {
    type: "note",
    channel: number,
    note: number,
    velocity: number,
    //on: boolean
}

export interface CCMessagePayload {
    type: "cc",
    channel: number,
    cc: number,
    value: number
}

export interface OscMessagePayload {
    type: "osc"
    address: string,
    args: Array<any>
}

export type AllowedPayloads = CCMessagePayload | NoteMessagePayload | OscMessagePayload;
