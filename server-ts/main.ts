import { Context, Hono } from '@hono/hono'
import { upgradeWebSocket } from '@hono/hono/deno'
import { MidiDriver, MidiMessage } from "@driver";
import { createMidiEventPayload, createWebsocketConnectionInfoPayload, WebsocketServerMessage } from "./messages.ts";
import { WSContext, WSEvents, WSMessageReceive } from "@hono/hono/ws";
import { cors } from '@hono/hono/cors'
import { Overlay } from "@widgets"
import { parse } from "@toml";
import { WebsocketEventHandler, WSState } from "./event_handler.ts";

class MidiState {
  bank_select: number = 0
  bank_select_fine: number = 0
  program: number = 0

  get currentConnectionId() {
    const c = new Array(WebsocketEventHandler.clients.values());

    if (this.bank_select < 0 || this.bank_select >= WebsocketEventHandler.clients.size) return null;
    return Array.from(WebsocketEventHandler.clients.keys())[this.bank_select]
  }

  mutate(msg: MidiMessage) {
    switch (msg.type) {
      case "ControlChange":
        if (msg.cc === 0) {
          this.bank_select = msg.value;
          return false
        } else if (msg.cc === 20) {
          this.bank_select_fine = msg.value;
          return false
        }
        return true
      case "ProgramChange":
        this.program = msg.value;
        return false

      default:
        return true
    }
  }
}



class WebsocketApplication {
  app = new Hono<{ Variables: WSState }>();
  static driver = new MidiDriver();
  static state = new MidiState();

  constructor() {
    this.app.get("/ws", upgradeWebSocket((c) => {
      return new WebsocketEventHandler(c);
    }));

    this.app.use("/overlays", cors())

    this.app.get("/overlays", async (c) => {
      const overlay_buffer = [];
      for await (const dirEntry of Deno.readDir("../overlays")) {
        if (dirEntry.isFile) {
          const ext = dirEntry.name.split(".").pop();
          if (ext == "toml") {

            console.log(dirEntry);
            const contents = await Deno.readTextFile("../overlays/" + dirEntry.name);
            const data = parse(contents);
            console.log(data);
            overlay_buffer.push(data);
          }
        }
      }
      return c.json(overlay_buffer);
      //let data = parse()
    })

    // frontend
    this.app.get("/", (c) => {
      return c.text("hello world")
    })

    WebsocketApplication.driver.emitter.addEventListener("data", (ev) => {
      const evt = ev as CustomEvent;
      console.log(evt.detail);

      const midiEvent = createMidiEventPayload(evt.detail);

      switch (midiEvent.type) {
        case "midi-event":
          if (WebsocketApplication.state.mutate(midiEvent.data)) {
            WebsocketEventHandler.broadcast(midiEvent, [])
          } else {
            // process state here
            const id = WebsocketApplication.state.currentConnectionId;
            switch (midiEvent.data.type) {
              case "NoteOn":
              case "NoteOff":
              case "ProgramChange":
                if (id !== null) {
                  const sock = WebsocketEventHandler.clients.get(id);
                  sock?.send(JSON.stringify(midiEvent));
                }
                break;
              case "ControlChange":
              case "Unknown":
            }
            console.log("state mutation: ", WebsocketApplication.state);
          }
      }
    });
    Deno.serve(this.app.fetch);
  }

  close() {
    for (const [id, ws] of WebsocketEventHandler.clients.entries()) {
      ws.close();
      WebsocketEventHandler.clients.delete(id);
    }

    WebsocketApplication.driver.close();
  }
}

const app = new WebsocketApplication();

Deno.addSignalListener('SIGINT', () => {
  console.log('Received SIGINT');
  app.close();

  setTimeout(() => Deno.exit(), 1000);
});