import { AllowedPayloads, CCMessagePayload, NoteMessagePayload } from "homebrewdj-web-client";
import { WidgetCallbacks, ReceiveDataCallback, SendNoteCallback, RegisterNoteCallback, SendCCCallback, RegisterCCCallback, UnregisterCCCallback, UnregisterNoteCallback } from "widgets";
import { uuid } from "./utils";

type CallbackMap = Map<number, Map<number, Map<string, ReceiveDataCallback>>>;

interface EventBusCallback {
    send(msg: AllowedPayloads): void;
}

export class EventBus implements WidgetCallbacks {
    sender?: EventBusCallback;
    ccCallbackMap: CallbackMap = new Map();
    noteCallbackMap: CallbackMap = new Map();

    setSender(sender: EventBusCallback) {
        this.sender = sender;
    }

    processNote({ channel, note, velocity, on }: NoteMessagePayload) {
        const c = this.noteCallbackMap.get(channel);
        const cc = c?.get(note)
        cc?.forEach((cb) => {
            cb(velocity)
        })
    }

    processCC({ channel, cc, value }: CCMessagePayload) {
        const c = this.ccCallbackMap.get(channel);
        const ccc = c?.get(cc);
        ccc?.forEach((cb) => {
            cb(value)
        })
    }

    sendNote(channel: number, note: number, velocity: number, on: boolean) {
        console.log("note", channel, note, velocity, on);
        if (this.sender) this.sender.send({
            type: "note",
            channel,
            note,
            velocity,
            on
        })
    }

    sendCC(channel: number, cc: number, value: number) {
        console.log("cc", channel, cc, value);
        if (this.sender) this.sender.send({
            type: "cc",
            channel,
            cc,
            value
        })
    }

    registerCC(channel: number, cc: number, cb: ReceiveDataCallback) {

        if (!this.ccCallbackMap.has(channel)) {
            this.ccCallbackMap.set(channel, new Map());
        }
        const channelMap = this.ccCallbackMap.get(channel);

        if (!channelMap?.has(cc)) {
            channelMap?.set(cc, new Map());
        }
        const ccMap = channelMap?.get(cc);
        const id = uuid()
        ccMap?.set(id, cb);

        return id
    }

    registerNote(channel: number, note: number, cb: ReceiveDataCallback) {
        if (!this.noteCallbackMap.has(channel)) {
            this.noteCallbackMap.set(channel, new Map());
        }
        const channelMap = this.noteCallbackMap.get(channel);

        if (!channelMap?.has(note)) {
            channelMap?.set(note, new Map())
        }
        const noteMap = channelMap?.get(note);
        const id = uuid()
        noteMap?.set(id, cb);
        return id
    }

    unregisterNote(channel: number, note: number, id: string) {
        if (!this.noteCallbackMap.has(channel)) {
            this.noteCallbackMap.set(channel, new Map());
        }
        const channelMap = this.noteCallbackMap.get(channel);

        if (!channelMap?.has(note)) {
            channelMap?.set(note, new Map());
        }

        const noteMap = channelMap?.get(note);
        noteMap?.delete(id);
    }

    unregisterCC(channel: number, cc: number, id: string) {
        if (!this.ccCallbackMap.has(channel)) {
            this.ccCallbackMap.set(channel, new Map());
        }
        const channelMap = this.ccCallbackMap.get(channel);

        if (!channelMap?.has(cc)) {
            channelMap?.set(cc, new Map());
        }
        const ccMap = channelMap?.get(cc);
        ccMap?.delete(id);
    }

}