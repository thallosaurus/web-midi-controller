import { CCEvent, MidiEvent, NoteEvent } from "./events.ts";
import { send } from "./websocket.ts";

type CCCallback = (value: number) => void;
type NoteCallback = (value: number) => void;

const cc_map = new Map<number, Map<number, Array<CCCallback>>>();
for (let ch = 0; ch < 16; ch++) {
    cc_map.set(ch + 1, new Map<number, Array<CCCallback>>());   //index + 1 for convenience
}

const note_map = new Map<number, Map<number, Array<NoteCallback>>>();
for (let ch = 0; ch < 16; ch++) {
    note_map.set(ch + 1, new Map<number, Array<NoteCallback>>());   //index + 1 for convenience
}

export const register_cc_widget = (channel: number, cc: number, cb: CCCallback) => {
    const channel_map = cc_map.get(channel)!;
    if (!channel_map.has(cc)) {
        channel_map.set(cc, []);
    }

    const c = channel_map.get(cc)!;
    c.push(cb);
};

export const cc_update_on_bus = (channel: number, cc: number, value: number) => {
    const ch = cc_map.get(channel)!;

    if (!ch.has(cc)) return;

    for (const cb of ch.get(cc)!) {
        console.log("updating " + cc);
        cb(value);
    }
};

export const register_midi_widget = (channel: number, note: number, cb: NoteCallback) => {
    const ch = note_map.get(channel)!;

    if (!ch.has(note)) {
        ch.set(note, []);
    }

    const n = ch.get(note)!;
    n.push(cb);
};

export const midi_update_on_bus = (channel: number, note: number, velocity: number) => {
    const ch = note_map.get(channel)!;

    if (!ch.has(note)) return;

    for (const cb of ch.get(note)!) {
        //console.log("note updating " + note);
        cb(velocity);
    }
};

/// Gets called, when the websocket client gets a message from another peer
export const process_external = (msg: string) => {
    //bus.dispatchEvent(ev);
    const data = JSON.parse(msg);
    //console.log(data);
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
    cc_update_on_bus(update.midi_channel, update.cc, update.value);
    //console.log(update);
});
bus.addEventListener("noteupdate", (ev: Event) => {
    const update = ev as NoteEvent;
    midi_update_on_bus(update.midi_channel, update.note, update.velocity);
});
