//import type { ClockPayloads } from "../clock/payloads.ts";

export interface ConnectedPayload {
    type: "connection",
    id: string,
    clientNumber: number
}

export interface ClientNumberPayload {
    type: "clientnumber"
    clientNumber: number
}

export interface ProgramChangeMessage {
    type: "pgrm",
    value: number
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

export interface ClockMessagePayload {
    type: "clock",
    data: ClockPayloads
}

export interface ControlState {
    type: "control"
    eventName: string
}

export interface TickState {
    type: "tick"
    tick: number,
    timestamp: number,
    delta: number,
    //bpm: number
}

export interface PositionState {
    type: "position",
    playing: boolean,
    tick: number,
    beat: number,
    sixteenth: number
}

export type ClockPayloads = PositionState | TickState | ControlState;

export type AllowedPayloads = CCMessagePayload
    | NoteMessagePayload
    | OscMessagePayload
    | ClientNumberPayload
    | ProgramChangeMessage
    | ClockMessagePayload;
