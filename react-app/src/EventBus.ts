import { AllowedPayloads, CCMessagePayload, NoteMessagePayload, OscMessagePayload } from "@hdj/homebrewdj-web-client";
import { uuid } from "./utils";
import { Widget } from "@hdj/definitions";
import { MidiCCRegisterFn, MidiCCSend, MidiCCUnregisterFn, MidiNoteRegisterFn, MidiNoteSend, MidiNoteUnregisterFn, MIDIReceiveDataCallback, OSCReceiveDataCallback, OscRegisterFn, OscSend, OscUnregisterFn, Outgoing, WCallbacks } from "@hdj/widgets";

type MIDICallbackMap = Map<number, Map<number, Map<string, MIDIReceiveDataCallback>>>;
type OSCCallbackMap = Map<string, Map<string, OSCReceiveDataCallback>>;

interface EventBusCallback {
    send(msg: AllowedPayloads): void;
}

export class EventBus extends WCallbacks {
    sender: Outgoing | null = null;
    
    setSender(sender: Outgoing) {
        this.sender = sender;
    }
}

export class EventBusOld implements WCallbacks {
    sender?: EventBusCallback;
    ccCallbackMap: MIDICallbackMap = new Map();
    noteCallbackMap: MIDICallbackMap = new Map();
    oscCallbackMap: OSCCallbackMap = new Map();
    next?: WCallbacks

    setNext(w: WCallbacks) {
        this.next = w;
    }

    setSender(sender: EventBusCallback) {
        this.sender = sender;
    }

    sendUiEvent(def: Widget) {
        throw new Error("not implemented");
    }

    processOSC({ address, args }: OscMessagePayload) {
        const c = this.oscCallbackMap.get(address);
        c?.forEach((cb) => {
            cb(args[0])
        });
    }

    processNote({ channel, note, velocity }: NoteMessagePayload) {
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

    /// MARK: - Interface Implementations

    sendNote: MidiNoteSend = ({ channel, note }, value: number) => {
        console.log("note", channel, note, value, value > 64);
        if (this.sender) this.sender.send({
            type: "note",
            channel,
            note,
            velocity: value,
            on: value > 64
        })
    }

    sendOSC: OscSend<number[]> = ({ address }, args: number[]) => {
        console.log("osc update", address, args);
        if (this.sender) this.sender.send({
            type: "oscmsg",
            address,
            args
        })
    }

    sendCC: MidiCCSend = ({ channel, cc }, value) => {
        console.log("cc", channel, cc, value);
        if (this.sender) this.sender.send({
            type: "cc",
            channel,
            cc,
            value
        })
    }

    registerOSC: OscRegisterFn = ({ address }, cb) => {
        if (!this.oscCallbackMap.has(address)) {
            this.oscCallbackMap.set(address, new Map());
        }

        const oscMap = this.oscCallbackMap.get(address);

        const id = uuid();
        oscMap?.set(id, cb);
        return id
    }

    unregisterOSC: OscUnregisterFn = (id, { address }) => {
        if (!this.oscCallbackMap.has(address)) {
            return;
        }
        const oscMap = this.oscCallbackMap.get(address);
        oscMap?.delete(id);
    }

    registerCC: MidiCCRegisterFn = (def, cb) => {
        const { channel, cc } = def;

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
        if (this.next) this.next.registerCC(def, cb);
        return id
    }

    registerNote: MidiNoteRegisterFn = (def, cb) => {
        if (!this.noteCallbackMap.has(def.channel)) {
            this.noteCallbackMap.set(def.channel, new Map());
        }
        const channelMap = this.noteCallbackMap.get(def.channel);

        if (!channelMap?.has(def.note)) {
            channelMap?.set(def.note, new Map())
        }
        const noteMap = channelMap?.get(def.note);
        const id = uuid()
        noteMap?.set(id, cb);
        if (this.next) this.next.registerNote(def, cb)
        return id
    }

    unregisterNote: MidiNoteUnregisterFn = (id, def) => {
        const { channel, note } = def;

        if (!this.noteCallbackMap.has(channel)) {
            this.noteCallbackMap.set(channel, new Map());
        }
        const channelMap = this.noteCallbackMap.get(channel);

        if (!channelMap?.has(note)) {
            channelMap?.set(note, new Map());
        }

        const noteMap = channelMap?.get(note);
        noteMap?.delete(id);
        if (this.next) this.next.unregisterNote(id, def);
    }

    unregisterCC: MidiCCUnregisterFn = (id, def) => {
        const { channel, cc } = def
        if (!this.ccCallbackMap.has(channel)) {
            this.ccCallbackMap.set(channel, new Map());
        }
        const channelMap = this.ccCallbackMap.get(channel);

        if (!channelMap?.has(cc)) {
            channelMap?.set(cc, new Map());
        }
        const ccMap = channelMap?.get(cc);
        ccMap?.delete(id);
        if (this.next) this.next.unregisterCC(id, def)
    }

}