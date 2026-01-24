import ws, { send } from "./websocket.ts";

abstract class MidiEvent extends Event {
    midi_channel: number;
    event_name: string;
    constructor(midi_channel: number, event_name: string) {
        super(event_name);
        this.midi_channel = midi_channel;
        //this.value = value;
        this.event_name = event_name;
    }
    abstract parse(s: string): MidiEvent;
}

export class NoteEvent extends MidiEvent {
    override parse(s: string): MidiEvent {
        return JSON.parse(s) as NoteEvent;
    }
    on: boolean;
    note: number;
    velocity: number;
    constructor(
        midi_channel: number,
        note: number,
        on: boolean,
        velocity: number,
    ) {
        super(midi_channel, "noteupdate");
        this.note = note;
        this.on = on;
        this.velocity = velocity;
    }
}

export class CCEvent extends MidiEvent {
    override parse(s: string): MidiEvent {
        return JSON.parse(s) as CCEvent;
    }
    value: number;
    cc: number;
    constructor(midi_channel: number, value: number, cc: number) {
        super(midi_channel, "ccupdate");
        this.value = value;
        this.cc = cc;
    }
}

type CCCallback = (value: number) => void;

const cc_map = new Map<number, Array<CCCallback>>();

export const register_widget = (cc: number, cb: CCCallback) => {
    if (!cc_map.has(cc)) {
        cc_map.set(cc, []);
    }

    const c = cc_map.get(cc)!;
    c.push(cb);
};

export const update_on_bus = (cc: number, value: number) => {
    if (!cc_map.has(cc)) return;

    for (const cb of cc_map.get(cc)!) {
        console.log("updating " + cc);
        cb(value);
    }
};

export const process_external = (msg: string) => {
    //bus.dispatchEvent(ev);
    console.log(msg);
    const data = JSON.parse(msg);
    switch (data.event_name) {
        case "ccupdate":
            {
                const data_t = data as CCEvent;
                bus.dispatchEvent(new CCEvent(data_t.midi_channel, data_t.value, data_t.cc));
            }
            break;
    }
};

export const process_internal = (ev: MidiEvent) => {
    //update_on_bus(cc, value)
    send(JSON.stringify(ev));
    bus.dispatchEvent(ev);
};

export const bus = new EventTarget();
bus.addEventListener("ccupdate", (ev: Event) => {
    const update = ev as CCEvent;
    update_on_bus(update.cc, update.value);
    //console.log(update);
});
