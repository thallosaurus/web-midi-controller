import { CCEvent, MidiEvent, NoteEvent } from "./events.ts";
//import { sendFrontendMidiEvent } from "./websocket/message.ts";
import { FrontendSocketEvent } from "./websocket/client.ts";
//import { sendUpdateCCValue, sendUpdateNoteValue } from "./event_bus/client/event_bus_client.ts";
import { sendUpdateCCValue, sendUpdateNoteValue } from './event_bus/client';

type CCWidget = Map<string, CCCallback>;//Array<CCCallback>;
type CCChannel = Map<number, CCWidget>;
type CCCallback = (value: number) => void;
type NoteWidget = Map<string, NoteCallback>;//Array<NoteCallback>;
type NoteChannel = Map<number, NoteWidget>;
type NoteCallback = (value: number) => void;

const cc_map = new Map<number, CCChannel>();
const note_map = new Map<number, NoteChannel>();

export abstract class EventBusReceiver {
    
}

/**
 * @deprecated
 */
const init_backend_maps = () => {
    for (let ch = 0; ch < 16; ch++) {
        const cc_channel = new Map<number, Map<string, CCCallback>>();//Array<CCCallback>>();
        cc_map.set(ch + 1, cc_channel);   //index + 1 for convenience
    }
    
    for (let ch = 0; ch < 16; ch++) {
        const note_channel = new Map<number, Map<string, NoteCallback>>();//Array<NoteCallback>>();
        note_map.set(ch + 1, note_channel);   //index + 1 for convenience
    }
}

// Register a CC Widget on the bus
/**
 * @deprecated
 * @param id
 * @param init 
 * @param channel 
 * @param cc 
 * @param cb 
 */
export const register_cc_widget = (id: string, init: number, channel: number, cc: number, cb: CCCallback) => {
    const channel_map = cc_map.get(channel)!;
    if (!channel_map.has(cc)) {
        channel_map.set(cc, new Map<string, CCCallback>());
    }
    console.log("registering cc ", cc, " on channel ", channel);

    const c = channel_map.get(cc)!;
    c.set(id, cb);
    //c.push(cb);

    cb(init);
};

/**
 * @deprecated
 * @param id 
 * @param channel 
 * @param cc 
 * @returns 
 */
export const unregister_cc_widget = (id: string, channel: number, cc: number) => {
    const ccch = cc_map.get(channel)!;
    
    if (!ccch.has(cc)) {
        return
    }
    
    console.log("unregistering cc widget ", cc, " on channel ", channel);
    const ccmap = ccch.get(cc)!;
    ccmap.delete(id);
}

// Update all widgets that are bound to the cc number
/**
 * @deprecated
 * @param channel 
 * @param cc 
 * @param value 
 * @returns 
 */
export const cc_update_on_bus = (channel: number, cc: number, value: number) => {
    const ch = cc_map.get(channel)!;

    if (!ch.has(cc)) return;

    for (const [_, cb] of new Map(ch.get(cc))!) {
        //console.log("updating " + cc);

        cb(value);

    }
};

// Register a midi widget on the bus
/**
 * @deprecated
 * @param id 
 * @param channel 
 * @param note 
 * @param cb 
 */
export const register_midi_widget = (id: string, channel: number, note: number, cb: NoteCallback) => {
    const ch = note_map.get(channel)!;
    //debugger;
    
    if (!ch.has(note)) {
        ch.set(note, new Map<string, NoteCallback>());
    }
    
    console.log("registering midi ", note, " on channel ", channel);
    const n = ch.get(note)!;
    n.set(id, cb)
};

export const unregister_midi_widget = (id: string, channel: number, note: number) => {
    const notech = note_map.get(channel)!;
    
    if (!notech.has(note)) {
        return
    }
    
    console.log("unregistering midi ", note, " on channel ", channel);
    const notemap = notech.get(note)!;
    notemap.delete(id);
}

// Update all widgets bound to the midi number
/**
 * @deprecated
 * @param channel 
 * @param note 
 * @param velocity 
 * @returns 
 */
export const midi_update_on_bus = (channel: number, note: number, velocity: number) => {
    const ch = note_map.get(channel)!;

    if (!ch.has(note)) return;

        for (const [_, cb] of new Map(ch.get(note))!) {
        //console.log("updating " + cc);

        cb(velocity);

    }
/*    for (const cb of ch.get(note)!) {
        //console.log("note updating " + note);
        cb(velocity);
    }*/
};

/// Gets called, when the websocket client gets a message from another peer
/**
 * @deprecated
 * @param data 
 */
export const process_external_compat = (data: MidiEvent) => {
    //bus.dispatchEvent(ev);
    //const data = JSON.parse(msg);
    console.log(data);
    switch (data.event_name) {
        case "ccupdate":
            {
                const data_t = data as CCEvent;
                bus.dispatchEvent(
                    new CCEvent(data_t.midi_channel, data_t.value, data_t.cc),
                );
            }
            break;

        case "noteupdate":
            {
                const data_t = data as NoteEvent;
                bus.dispatchEvent(
                    new NoteEvent(
                        data_t.midi_channel,
                        data_t.note,
                        data_t.on,
                        data_t.velocity,
                    ),
                );
            }
            break;
    }
};

/// Should be called when an widget gets modified to update the state
// and send it to the server which broadcasts it around
/**
 * @deprecated
 * @param ev 
 * @returns 
 */
export const process_internal = (ev: MidiEvent) => {

    //send(JSON.stringify(ev));
    if (import.meta.env.VITE_USE_WORKER_EVENT_BUS) {
        console.log("worker event bus stub")
            //sendFrontendMidiEvent(ebWorker!, ev);
            if (ev.event_name == "ccupdate") {
                const cc_ev = ev as CCEvent;
                sendUpdateCCValue(cc_ev.midi_channel, cc_ev.cc, cc_ev.value);
                return
            } else if (ev.event_name == "noteupdate") {
                const note_ev = ev as NoteEvent;
                sendUpdateNoteValue(note_ev.midi_channel, note_ev.note, note_ev.velocity, note_ev.on)
                return;
            }
    } else {
        FrontendSocketEvent(ev);
        bus.dispatchEvent(ev);
    }
};

/**
 * @deprecated
 */
export const bus = new EventTarget();

/**
 * @deprecated
 */
export const init_event_bus = () => {
    init_backend_maps();

    bus.addEventListener("ccupdate", (ev: Event) => {
        const update = ev as CCEvent;
        cc_update_on_bus(update.midi_channel, update.cc, update.value);
        //console.log(update);
    });
    bus.addEventListener("noteupdate", (ev: Event) => {
        const update = ev as NoteEvent;
        midi_update_on_bus(update.midi_channel, update.note, update.velocity);
    });
}
