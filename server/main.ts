import { Hono } from "@hono/hono";
import { upgradeWebSocket } from "@hono/hono/deno";
import { MidiDriver } from "@driver";
import { createMidiEventPayload } from "./messages.ts";
import { cors } from "@hono/hono/cors";
import { parse } from "@toml";
import { WebsocketEventHandler, WSState } from "./event_handler.ts";
import { CoreServerState, CoreServerStateEvents } from "./state.ts";
import { serveFrontend } from "./frontend.ts";
import { parseArguments, ServerSettings } from "./args.ts";

export class ServerMain {
  app = new Hono<{ Variables: WSState }>();
  readonly driver
  readonly state;

  constructor(settings: ServerSettings) {
    this.driver = new MidiDriver(settings.midi)
    this.state = new CoreServerState(settings.midi.systemChannel);
    
    this.app.get(
      "/ws",
      upgradeWebSocket((c) => {
        return new WebsocketEventHandler(c, this.state);
      }),
    );

    this.app.use("/overlays", cors());
    this.app.get("/overlays", async (c) => {
      return c.json(await this.getOverlaysFromDisk(settings.path.overlayPath));
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
      const midiEvent = (evt.detail as CoreServerStateEvents);

      //console.log("state event", midiEvent);

      // broadcast
      switch (midiEvent.type) {
        case "note":
          WebsocketEventHandler.broadcast({
            type: "midi-data",
            data: midiEvent.payload
          }, [])
          this.driver.sendMidi(midiEvent.payload!);
          break;

        case "cc":
          WebsocketEventHandler.broadcast({
            type: "midi-data",
            data: midiEvent.payload
          }, []);
          this.driver.sendMidi(midiEvent.payload!);
          break;

        case "overlay":
          console.log("overlay event", midiEvent);
          //if (midiEvent.target)
          WebsocketEventHandler.direct({
            type: "midi-data",
            data: {
              type: "ProgramChange",
              value: midiEvent.overlayId,
              channel: 0
            }
          }, midiEvent.target)
          break;
      }

    });

    // we got a message from the MIDI Driver
    this.driver.emitter.addEventListener("data", (ev) => {
      const evt = ev as CustomEvent;

      const midiEvent = createMidiEventPayload(evt.detail);

      //console.log("midi event", midiEvent);

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

  async getOverlaysFromDisk(path: string) {
    const overlay_buffer = [];
    for await (const dirEntry of Deno.readDir(path)) {
      if (dirEntry.isFile) {
        const ext = dirEntry.name.split(".").pop();
        if (ext == "toml") {
          console.log(dirEntry);
          const contents = await Deno.readTextFile(
            path + "/" + dirEntry.name,
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

const args = parseArguments();
const app = new ServerMain(args);

Deno.addSignalListener("SIGINT", () => {
  console.log("Received SIGINT");
  app.close();

  setTimeout(() => Deno.exit(), 1000);
});
