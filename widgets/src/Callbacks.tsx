import { osc, midi, NoteProperties, CCProperties, Widget } from "@hdj/definitions";
import { createContext, useContext } from "react";
import { uuid } from "./utils";

type WidgetId = string;
export type MIDIReceiveDataCallback = (v: number) => void;
export type OSCReceiveDataCallback = (v: number) => void;

export type RegisterFn<Proto, ReceiveCB> = (def: Proto, cb: ReceiveCB) => WidgetId
export type UnregisterFn<Proto> = (id: WidgetId, def: Proto) => void
export type SendFn<Proto, T> = (def: Proto, value: T) => void

export type OscRegisterFn = RegisterFn<osc, OSCReceiveDataCallback>;
export type OscUnregisterFn = UnregisterFn<osc>;
export type OscSend<T = number[]> = SendFn<osc, T>;

export interface OSCWidgetCallbacks {
    registerOSC: OscRegisterFn
    unregisterOSC: OscUnregisterFn
    sendOSC: OscSend
}

export interface MidiNoteWidgetCallbacks {
    registerNote: MidiNoteRegisterFn,
    unregisterNote: MidiNoteUnregisterFn,
    sendNote: MidiNoteSend,
}

export type MidiNoteRegisterFn = RegisterFn<MidiNoteProperties, MIDIReceiveDataCallback>;
export type MidiNoteUnregisterFn = UnregisterFn<MidiNoteProperties>;
export type MidiNoteSend = SendFn<MidiNoteProperties, number>;

export interface MidiCCWidgetCallbacks {
    registerCC: MidiCCRegisterFn,
    unregisterCC: MidiCCUnregisterFn,
    sendCC: MidiCCSend,
}

export type MidiCCRegisterFn = RegisterFn<MidiCCProperties, MIDIReceiveDataCallback>;
export type MidiCCUnregisterFn = UnregisterFn<MidiCCProperties>;
export type MidiCCSend = SendFn<MidiCCProperties, number>;

type MidiNoteProperties = midi & NoteProperties;
type MidiCCProperties = midi & CCProperties;

type MIDICallbackMap = Map<number, Map<number, Map<string, MIDIReceiveDataCallback>>>;
type OSCCallbackMap = Map<string, Map<string, OSCReceiveDataCallback>>;

export type DeltaMessages = NoteDelta | CCDelta | OscDelta;

interface NoteDelta {
    type: "note",
    channel: number,
    note: number,
    velocity: number
}

interface CCDelta {
    type: "cc",
    channel: number,
    cc: number,
    value: number
}

interface OscDelta {
    type: "osc"
    address: string,
    args: Array<any>
}

export interface Outgoing {
    send(msg: DeltaMessages): void;
}

interface InternalCallbackMap {
    ccCallbackMap: MIDICallbackMap;
    noteCallbackMap: MIDICallbackMap;
    oscCallbackMap: OSCCallbackMap;
}

export abstract class WCallbacks {
    abstract sender: Outgoing | null;
    private sendNote: MidiNoteSend = ({ channel, note }, velocity) => {
        console.log("note", channel, note, velocity, velocity > 64);
        if (this.sender) this.sender.send({
            type: "note",
            channel,
            note,
            velocity,
            //on: value > 64
        })
    }
    private registerNote: MidiNoteRegisterFn = (def, cb) => {

        if (!this.callbacks.noteCallbackMap.has(def.channel)) {
            this.callbacks.noteCallbackMap.set(def.channel, new Map());
        }
        const channelMap = this.callbacks.noteCallbackMap.get(def.channel);

        if (!channelMap?.has(def.note)) {
            channelMap?.set(def.note, new Map())
        }
        const noteMap = channelMap?.get(def.note);
        const id = uuid()
        noteMap?.set(id, cb);
        //if (this.next) this.next.registerNote(def, cb)
        return id
    }

    private sendCC: MidiCCSend = ({ channel, cc }, value) => {
        console.log("cc", channel, cc, value);
        if (this.sender) this.sender.send({
            type: "cc",
            channel,
            cc,
            value
        })
    }

    private registerCC: MidiCCRegisterFn = (def, cb) => {
        const { channel, cc } = def;

        if (!this.callbacks.ccCallbackMap.has(channel)) {
            this.callbacks.ccCallbackMap.set(channel, new Map());
        }
        const channelMap = this.callbacks.ccCallbackMap.get(channel);

        if (!channelMap?.has(cc)) {
            channelMap?.set(cc, new Map());
        }
        const ccMap = channelMap?.get(cc);
        const id = uuid()
        ccMap?.set(id, cb);
        //if (this.next) this.next.registerCC(def, cb);
        return id
    }

    private unregisterCC: MidiCCUnregisterFn = (id, def) => {
        const { channel, cc } = def
        if (!this.callbacks.ccCallbackMap.has(channel)) {
            this.callbacks.ccCallbackMap.set(channel, new Map());
        }
        const channelMap = this.callbacks.ccCallbackMap.get(channel);

        if (!channelMap?.has(cc)) {
            channelMap?.set(cc, new Map());
        }
        const ccMap = channelMap?.get(cc);
        ccMap?.delete(id);
        //if (this.next) this.next.unregisterCC(id, def)
    }

    private unregisterNote: MidiNoteUnregisterFn = (id, def) => {
        const { channel, note } = def;

        if (!this.callbacks.noteCallbackMap.has(channel)) {
            this.callbacks.noteCallbackMap.set(channel, new Map());
        }
        const channelMap = this.callbacks.noteCallbackMap.get(channel);

        if (!channelMap?.has(note)) {
            channelMap?.set(note, new Map());
        }

        const noteMap = channelMap?.get(note);
        noteMap?.delete(id);
        //if (this.next) this.next.unregisterNote(id, def);
    }

    private sendOSC: OscSend<number[]> = ({ address }, args: number[]) => {
        console.log("osc update", address, args);
        if (this.sender) this.sender.send({
            type: "osc",
            address,
            args
        })
    }
    private registerOSC: OscRegisterFn = ({ address }, cb) => {
        if (!this.callbacks.oscCallbackMap.has(address)) {
            this.callbacks.oscCallbackMap.set(address, new Map());
        }

        const oscMap = this.callbacks.oscCallbackMap.get(address);

        const id = uuid();
        oscMap?.set(id, cb);
        return id
    }

    private unregisterOSC: OscUnregisterFn = (id, { address }) => {
        if (!this.callbacks.oscCallbackMap.has(address)) {
            return;
        }
        const oscMap = this.callbacks.oscCallbackMap.get(address);
        oscMap?.delete(id);
    }

    private callbacks: InternalCallbackMap = {
        ccCallbackMap: new Map(),
        noteCallbackMap: new Map(),
        oscCallbackMap: new Map(),
    }

    register(def: MidiNoteProperties | MidiCCProperties | osc, cb: MIDIReceiveDataCallback | OSCReceiveDataCallback): WidgetId {
        switch (def.output) {
            case "midi":
                {
                    if ((def as MidiNoteProperties).note) {
                        // register midi note
                        return this.registerNote(def as MidiNoteProperties, cb)
                    } else if ((def as MidiCCProperties).cc) {
                        // register cc
                        return this.registerCC(def as MidiCCProperties, cb);
                    }
                }
                break;
            case "osc":
                //register osc
                return this.registerOSC(def, cb);
        }
    }
    unregister(id: string, def: MidiNoteProperties | MidiCCProperties | osc) {
        switch (def.output) {
            case "midi":
                {
                    if ((def as MidiNoteProperties).note) {
                        // register midi note
                        this.unregisterNote(id, def as MidiNoteProperties)
                        break;
                    } else if ((def as MidiCCProperties).cc) {
                        // register cc
                        this.unregisterCC(id, def as MidiCCProperties);
                        break;
                    }
                }
                break;
            case "osc":
                //register osc
                this.unregisterOSC(id, def);
                break;
        }
    }

    send<T>(def: MidiNoteProperties | MidiCCProperties | osc, value: T) {
        switch (def.output) {
            case "midi":
                {
                    if ((def as MidiNoteProperties).note) {
                        // register midi note
                        this.sendNote(def as MidiNoteProperties, value as number)
                        break;
                    } else if ((def as MidiCCProperties).cc) {
                        // register cc
                        this.sendCC(def as MidiCCProperties, value as number);
                        break;
                    }
                }
                break;
            case "osc":
                //register osc
                this.sendOSC(def, value as number[]);
                break;
        }
    }

    private externalOsc({ address, args }: OscDelta) {
        const c = this.callbacks.oscCallbackMap.get(address);
        c?.forEach((cb) => {
            cb(args[0])
        });
    }

    private externalNote({ channel, note, velocity }: NoteDelta) {
        const c = this.callbacks.noteCallbackMap.get(channel);
        const cc = c?.get(note)
        cc?.forEach((cb) => {
            cb(velocity)
        })
    }

    private externalCC({ channel, cc, value }: CCDelta) {
        const c = this.callbacks.ccCallbackMap.get(channel);
        const ccc = c?.get(cc);
        ccc?.forEach((cb) => {
            cb(value)
        })
    }

    extInput(msg: (NoteDelta | CCDelta | OscDelta)) {
        switch (msg.type) {
            case "note":
                this.externalNote(msg);
                break;
            case "cc":
                this.externalCC(msg);
                break;
            case "osc":
                this.externalOsc(msg);
        }
    }
}

export interface UiEventCallbacks {
    sendUiEvent: (def: Widget) => void;
}

export const WidgetActionContext = createContext<WCallbacks | null>(null);
export function useWidgetAction() {

    const bus = useContext(WidgetActionContext);

    if (!bus) throw new Error("Missing EventBusProvider");

    return bus;

}