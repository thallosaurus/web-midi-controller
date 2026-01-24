import { midi } from "https://deno.land/x/deno_midi/mod.ts";

const midi_out = new midi.Output();
console.log(midi_out.getPorts());

midi_out.openPort(0);

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
        console.log(`RECEIVED: ${event.data}`);
        socket.send("pong");
      };
      socket.onclose = () => console.log("DISCONNECTED");
      socket.onerror = (error) => console.error("ERROR:", error);

      return response;
    },
  });
}
