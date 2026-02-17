import { Hono } from "@hono/hono";
import { upgradeWebSocket } from "@hono/hono/deno";
import { MidiDriver } from "@driver";
import { createMidiEventPayload } from "./messages.ts";
import { cors } from "@hono/hono/cors";
import { parse } from "@toml";
import { WebsocketEventHandler, WSState } from "./event_handler.ts";
import { CoreServerState } from "./state.ts";
import { serveFrontend } from "./frontend.ts";

export class ServerMain {
  app = new Hono<{ Variables: WSState }>();
  readonly driver = new MidiDriver();
  readonly state = new CoreServerState();

  constructor() {
    this.app.get(
      "/ws",
      upgradeWebSocket((c) => {
        return new WebsocketEventHandler(c, this.state);
      }),
    );

    this.app.use("/overlays", cors());
    this.app.get("/overlays", async (c) => {
      return c.json(await this.getOverlaysFromDisk());
      //let data = parse()
    });

    // frontend
    this.app.get("/", async (c) => {
      const file = await serveFrontend(c.req);

      return file;
    });
    // frontend
    this.app.get("/assets/*", async (c) => {
      const file = await serveFrontend(c.req);

      return file;
    });

    // the state got changed
    this.state.events.addEventListener("data", (ev) => {
      const evt = ev as CustomEvent;
      const midiEvent = evt.detail;

      console.log("state event", midiEvent);

      // broadcast

      WebsocketEventHandler.broadcast(midiEvent, []);
      this.driver.sendMidi(midiEvent.payload!);
    });

    // we got a message from the MIDI Driver
    this.driver.emitter.addEventListener("data", (ev) => {
      const evt = ev as CustomEvent;

      const midiEvent = createMidiEventPayload(evt.detail);

      console.log("midi event", midiEvent);

      switch (midiEvent.type) {
        case "midi-data":
          this.state.inputData(midiEvent.data);
          break;
      }
    });
    Deno.serve(this.app.fetch);
  }

  close() {
    for (const [id, ws] of WebsocketEventHandler.clients.entries()) {
      ws.close();
      WebsocketEventHandler.clients.delete(id);
    }

    this.driver.close();
  }

  async getOverlaysFromDisk() {
    const overlay_buffer = [];
    for await (const dirEntry of Deno.readDir("../overlays")) {
      if (dirEntry.isFile) {
        const ext = dirEntry.name.split(".").pop();
        if (ext == "toml") {
          console.log(dirEntry);
          const contents = await Deno.readTextFile(
            "../overlays/" + dirEntry.name,
          );
          const data = parse(contents);
          console.log(data);
          overlay_buffer.push(data);
        }
      }
    }
    return overlay_buffer;
  }
}

const app = new ServerMain();

Deno.addSignalListener("SIGINT", () => {
  console.log("Received SIGINT");
  app.close();

  setTimeout(() => Deno.exit(), 1000);
});
