import { midi } from "https://deno.land/x/deno_midi/mod.ts";

import type { CCSliderEvent } from './web/src/slider';

const midi_name = "IAC Driver Bus 1";

const midi_out = new midi.Output();
const output_index = midi_out.getPorts().findIndex((v, i) => v == midi_name);
midi_out.openPort(output_index);
// Send a note on.
//midi_out.sendMessage(new midi.NoteOn({ note: 0x3C, velocity: 0x7F }))

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  Deno.serve({
    port: 8080,
    async handler(request) {
      if (request.headers.get("upgrade") !== "websocket") {
        // If the request is a normal HTTP request,
        // we serve the client HTML file.
        const file = await Deno.open("./index.html", { read: true });
        return new Response(file.readable);
      }
      // If the request is a websocket upgrade,
      // we need to use the Deno.upgradeWebSocket helper
      const { socket, response } = Deno.upgradeWebSocket(request);

      socket.onopen = () => {
        console.log("CONNECTED");
      };
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        switch (data.event_name) {
          case "ccupdate":
            midi_out.sendMessage(new midi.ControlChange({ value: data.value, controller: data.cc, channel: data.channel }));
            break;
        }
        console.log(data);
      };
      socket.onclose = () => console.log("DISCONNECTED");
      socket.onerror = (error) => console.error("ERROR:", error);

      return response;
    },
  });
}
