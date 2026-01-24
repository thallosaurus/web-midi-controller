export abstract class MidiEvent extends Event {
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
