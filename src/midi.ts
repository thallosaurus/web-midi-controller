import { midi } from "https://deno.land/x/deno_midi/mod.ts";
import { CCEvent, NoteEvent } from "../web/src/events.ts";

const midi_name = "IAC Driver Bus 1";

export const midi_out = new midi.Output();
const output_index = midi_out.getPorts().findIndex((v, i) => v == midi_name);
midi_out.openPort(output_index);

export function send_note_update(msg: NoteEvent) {
  if (msg.on) {

    midi_out.sendMessage(
      new midi.NoteOn({
        channel: msg.midi_channel,
        note: msg.note,
        velocity: msg.velocity,
      })
    )
  } else {
    midi_out.sendMessage(
      new midi.NoteOff({
        channel: msg.midi_channel,
        note: msg.note,
        velocity: msg.velocity,
      })
    )

  }
}

export function send_cc_update(msg: CCEvent) {
  midi_out.sendMessage(
    new midi.ControlChange({
      value: msg.value,
      controller: msg.cc,
      channel: msg.midi_channel,
    }),
  );
}
