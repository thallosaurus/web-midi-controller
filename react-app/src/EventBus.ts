import { AllowedPayloads, CCMessagePayload, NoteMessagePayload, OscMessagePayload } from "@hdj/homebrewdj-web-client";
import { WidgetCallbacks, MIDIReceiveDataCallback, OSCReceiveDataCallback } from "@hdj/widgets";
import { uuid } from "./utils";

type MIDICallbackMap = Map<number, Map<number, Map<string, MIDIReceiveDataCallback>>>;
type OSCCallbackMap = Map<string, Map<string, OSCReceiveDataCallback>>;

interface EventBusCallback {
    send(msg: AllowedPayloads): void;
}

export class EventBus implements WidgetCallbacks {
    sender?: EventBusCallback;
    ccCallbackMap: MIDICallbackMap = new Map();
    noteCallbackMap: MIDICallbackMap = new Map();
    oscCallbackMap: OSCCallbackMap = new Map();
    next?: WidgetCallbacks
    
    setNext(w: WidgetCallbacks) {
        this.next = w;
    }
    
    setSender(sender: EventBusCallback) {
        this.sender = sender;
    }

    processOSC({ address, args }: OscMessagePayload) {
        const c = this.oscCallbackMap.get(address);
        c?.forEach((cb) => {
            cb(args[0])
        });
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
    
    sendOSC(address: string, args: any[]) {
        console.log("osc update", address, args);
        if (this.sender) this.sender.send({
            type: "oscmsg",
            address,
            args
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

    registerOSC(address: string, cb: OSCReceiveDataCallback) {
        if (!this.oscCallbackMap.has(address)) {
            this.oscCallbackMap.set(address, new Map());
        }

        const oscMap = this.oscCallbackMap.get(address);
        
        const id = uuid();
        oscMap?.set(id, cb);
        return id
    }

    unregisterOSC(address: string, id: string) {
        if (!this.oscCallbackMap.has(address)) {
            return;
        }
        const oscMap = this.oscCallbackMap.get(address);
        oscMap?.delete(id);
    }

    registerCC(channel: number, cc: number, cb: MIDIReceiveDataCallback) {

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
        if (this.next) this.next.registerCC(channel, cc, cb);
        return id
    }

    registerNote(channel: number, note: number, cb: MIDIReceiveDataCallback) {
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
        if (this.next) this.next.registerNote(channel, note, cb)
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
        if (this.next) this.next.unregisterNote(channel, note, id);
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
        if (this.next) this.next.unregisterCC(channel, cc, id)
    }

}