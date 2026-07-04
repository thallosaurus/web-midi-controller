import { osc, midi, NoteProperties, CCProperties, Widget, ValueProperties } from "@hdj/definitions";
import { createContext, useContext } from "react";
import { uuid } from "./utils";

type WidgetId = string;
export type ReceiveDataCallback = (v: number) => void;
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

export type MidiNoteProperties = midi & NoteProperties;
export type MidiCCProperties = midi & CCProperties;

type CallbackMap<T> = { callbacks: Map<string, T>, lastValue: number };

type MIDICallbackMap = Map<number, Map<number, CallbackMap<MIDIReceiveDataCallback>>>;
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

function isMidiNote(def: MidiNoteProperties | MidiCCProperties | osc): def is MidiNoteProperties {
    return (def.output === "midi" && "note" in def)
}

function isMidiCC(def: MidiNoteProperties | MidiCCProperties | osc): def is MidiCCProperties {
    return (def.output === "midi" && "cc" in def)
}

function isOSC(def: MidiNoteProperties | MidiCCProperties | osc): def is osc {
    return (def.output === "osc")
}

function hasScalingProperties(value: ValueProperties | null): value is ValueProperties {
    return value !== null
        && (Object.keys(value).includes("min") || Object.keys(value).includes("max") || Object.keys(value).includes("default"))
}

export abstract class WCallbacks {
    abstract sender: Outgoing | null;

    private callbacks: InternalCallbackMap = {
        ccCallbackMap: new Map(),
        noteCallbackMap: new Map(),
        oscCallbackMap: new Map(),
    }

    private registerNote: MidiNoteRegisterFn = (def, cb) => {

        if (!this.callbacks.noteCallbackMap.has(def.channel)) {
            this.callbacks.noteCallbackMap.set(def.channel, new Map());
        }
        const channelMap = this.callbacks.noteCallbackMap.get(def.channel);

        if (!channelMap?.has(def.note)) {
            channelMap?.set(def.note, { callbacks: new Map(), lastValue: 0 })
        }
        const noteMap = channelMap?.get(def.note).callbacks;
        const id = uuid()
        noteMap?.set(id, cb);
        //if (this.next) this.next.registerNote(def, cb)
        return id
    }

    private registerCC: MidiCCRegisterFn = (def, cb) => {
        const { channel, cc } = def;

        if (!this.callbacks.ccCallbackMap.has(channel)) {
            this.callbacks.ccCallbackMap.set(channel, new Map());
        }
        const channelMap = this.callbacks.ccCallbackMap.get(channel);

        if (!channelMap?.has(cc)) {
            channelMap?.set(cc, { callbacks: new Map(), lastValue: 0 });
        }
        const ccMap = channelMap?.get(cc).callbacks;
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
            channelMap?.set(cc, { callbacks: new Map(), lastValue: 0 });
        }
        const ccMap = channelMap?.get(cc).callbacks;
        ccMap?.delete(id);

        // cleanup
        if (ccMap.size === 0) {
            channelMap.delete(cc);
        }

        if (channelMap.size === 0) {
            this.callbacks.ccCallbackMap.delete(cc);
        }
        console.log(this.callbacks.ccCallbackMap);
        //if (this.next) this.next.unregisterCC(id, def)
    }

    private unregisterNote: MidiNoteUnregisterFn = (id, def) => {
        const { channel, note } = def;

        if (!this.callbacks.noteCallbackMap.has(channel)) {
            this.callbacks.noteCallbackMap.set(channel, new Map());
        }
        const channelMap = this.callbacks.noteCallbackMap.get(channel);

        if (!channelMap?.has(note)) {
            channelMap?.set(note, { callbacks: new Map(), lastValue: 0 });
        }

        const noteMap = channelMap?.get(note).callbacks;
        noteMap?.delete(id);

        // cleanup
        if (noteMap.size === 0) {
            channelMap.delete(note);
        }

        if (channelMap.size === 0) {
            this.callbacks.noteCallbackMap.delete(channel);
        }
        console.log(this.callbacks.noteCallbackMap);
        //if (this.next) this.next.unregisterNote(id, def);
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

    register(def: MidiNoteProperties | MidiCCProperties | osc, cb: MIDIReceiveDataCallback | OSCReceiveDataCallback): WidgetId {
        console.log("registering", def)
        if (isMidiNote(def)) return this.registerNote(def, cb)
        if (isMidiCC(def)) return this.registerCC(def, cb)
        if (isOSC(def)) return this.registerOSC(def, cb)
        throw new Error("unsupported properties")
    }

    unregister(id: string, def: MidiNoteProperties | MidiCCProperties | osc) {
        console.log("unregistering", def)
        if (isMidiNote(def)) return this.unregisterNote(id, def)
        if (isMidiCC(def)) return this.unregisterCC(id, def)
        if (isOSC(def)) return this.unregisterOSC(id, def)
        throw new Error("unsupported properties")
    }

    send(def: MidiNoteProperties | MidiCCProperties | osc, value: number) {
        if (isMidiNote(def)) {
            const c = this.callbacks.noteCallbackMap.get(def.channel).get(def.note);

            console.log("note", def.channel, def.note, value, value > 64);
            if (c.lastValue != value) {

                const msg: NoteDelta = {
                    type: "note",
                    channel: def.channel,
                    note: def.note,
                    velocity: value,
                    //on: value > 64
                };

                c.lastValue = value
                if (this.sender) this.sender.send(msg);
                this.extInput(msg);
            }
            return
        }
        if (isMidiCC(def)) {
            const c = this.callbacks.ccCallbackMap.get(def.channel).get(def.cc);
            if (c.lastValue != value) {
                console.log("cc", def.channel, def.cc, value);
                const msg: CCDelta = {
                    type: "cc",
                    channel: def.channel,
                    cc: def.cc,
                    value: Math.floor(value * 127)
                };

                c.lastValue = value;
                if (this.sender) this.sender.send(msg)
                this.extInput(msg);
            }
            return

            //return this.sendCC(def, Math.floor(value * 127))
        }
        if (isOSC(def)) {
            console.log("osc update", def.address, value);
            const msg: OscDelta = {
                type: "osc",
                address: def.address,
                args: [value]
            };

            if (this.sender) this.sender.send(msg)
            return
        }
        throw new Error("unsupported properties")
    }

    private runCallbacks(map: CallbackMap<ReceiveDataCallback>, value: number) {
        map.callbacks.forEach((cb) => {
            cb(value)
        });
    }

    private externalOsc({ address, args }: OscDelta) {
        const c = this.callbacks.oscCallbackMap.get(address);
        c?.forEach((cb) => {
            cb(args[0])
        });
    }

    extInput(msg: (NoteDelta | CCDelta | OscDelta)) {
        switch (msg.type) {
            case "note":
                {

                    const c = this.callbacks.noteCallbackMap.get(msg.channel);
                    const cc = c?.get(msg.note)
                    this.runCallbacks(cc, msg.velocity);
                }
                break;
            case "cc":
                {

                    const c = this.callbacks.ccCallbackMap.get(msg.channel);
                    const ccc = c?.get(msg.cc);
                    this.runCallbacks(ccc, msg.value / 127);
                }
                break;
            case "osc":
                this.externalOsc(msg);
                break;
            default:
                throw new Error("invalid external input")
        }
    }
}

export const WidgetActionContext = createContext<WCallbacks | null>(null);
export function useWidgetAction() {
    const bus = useContext(WidgetActionContext);
    if (!bus) throw new Error("Missing WidgetActionContext");
    return bus;
}