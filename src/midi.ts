import { midi } from "https://deno.land/x/deno_midi/mod.ts";
import { NoteEvent, type CCEvent } from "../web/src/events.ts";
import { broadcast } from "./socket.ts";

const midi_name_in = "IAC Driver Bus 1";
const midi_name_out = "IAC Driver Bus 1";

const midi_out = new midi.Output();
const output_index = midi_out.getPorts().findIndex((v, i) => v == midi_name_out);
midi_out.openPort(output_index);

const midi_in = new midi.Input();
const input_index = midi_in.getPorts().findIndex((v, i) => v == midi_name_in)
midi_in.openPort(input_index);

midi_in.on("note", (ev) => {
  //let event = new CCEvent()
  //let event = new NoteEvent()
  //broadcast()
  console.log(ev);
  const event = new NoteEvent(ev.message.data.channel ?? 1, ev.message.data.note, ev.message.isNoteOn(), ev.message.data.velocity);
  broadcast(JSON.stringify(event), [])
})

export function send_note_update(msg: NoteEvent) {
  //console.log(msg);
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
