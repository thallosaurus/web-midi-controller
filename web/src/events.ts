export class CCEvent extends Event {
    midi_channel: number;
    value: number;
    cc: number;
    event_name = "ccupdate";
    constructor(midi_channel: number, value: number, cc: number) {
        super("ccupdate");
        this.midi_channel = midi_channel;
        this.value = value;
        this.cc = cc;
    }
}