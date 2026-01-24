import { CCEvent, MidiEvent, NoteEvent } from "./events.ts";
import { send } from "./websocket.ts";

type CCCallback = (value: number) => void;
type NoteCallback = (value: number) => void;

const cc_map = new Map<number, Array<CCCallback>>();
const note_map = new Map<number, Array<NoteCallback>>();

export const register_cc_widget = (cc: number, cb: CCCallback) => {
    if (!cc_map.has(cc)) {
        cc_map.set(cc, []);
    }

    const c = cc_map.get(cc)!;
    c.push(cb);
};

export const cc_update_on_bus = (cc: number, value: number) => {
    if (!cc_map.has(cc)) return;

    for (const cb of cc_map.get(cc)!) {
        console.log("updating " + cc);
        cb(value);
    }
};

export const register_midi_widget = (note: number, cb: NoteCallback) => {
    if (!note_map.has(note)) {
        note_map.set(note, []);
    }

    const n = note_map.get(note)!;
    n.push(cb);
};

export const midi_update_on_bus = (note: number, velocity: number) => {
    if (!note_map.has(note)) return;

    for (const cb of note_map.get(note)!) {
        console.log("note updating " + note);
        cb(velocity);
    }
};

/// Gets called, when the websocket client gets a message from another peer
export const process_external = (msg: string) => {
    //bus.dispatchEvent(ev);
    const data = JSON.parse(msg);
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
export const process_internal = (ev: MidiEvent) => {
    //update_on_bus(cc, value)
    send(JSON.stringify(ev));
    bus.dispatchEvent(ev);
};

export const bus = new EventTarget();
bus.addEventListener("ccupdate", (ev: Event) => {
    const update = ev as CCEvent;
    cc_update_on_bus(update.cc, update.value);
    //console.log(update);
});
bus.addEventListener("noteupdate", (ev: Event) => {
    const update = ev as NoteEvent;
    midi_update_on_bus(update.note, update.velocity);
});
