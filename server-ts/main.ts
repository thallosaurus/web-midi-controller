import { Context, Hono } from '@hono/hono'
import { upgradeWebSocket } from '@hono/hono/deno'
import { MidiDriver, MidiMessage } from "@driver";
import { createMidiEventPayload, createWebsocketConnectionInfoPayload, WebsocketEvent, WebsocketEventPayload } from "./messages.ts";
import { WSContext, WSEvents, WSMessageReceive } from "@hono/hono/ws";
import { cors } from '@hono/hono/cors'
import { Overlay } from "@widgets"
import { parse } from "@toml";

type WSState = {
  clientId: string
};

enum WebsocketMessageDecision {
  Broadcast,
  Disconnect
}

class WebsocketEventHandler implements WSEvents<WebSocket> {
  static clients: Map<string, WebSocket> = new Map();
  ctx: Context
  constructor(c: Context<{ Variables: WSState }, any, {}>) {
    this.ctx = c;
  }
  onOpen(evt: Event, ws: WSContext<WebSocket>): void {
    const connInfo = createWebsocketConnectionInfoPayload();
    //c.set("clientId", connInfo.connectionId);
    this.ctx.set("clientId", connInfo.connectionId);
    WebsocketEventHandler.clients.set(connInfo.connectionId, ws.raw!);
    ws.send(JSON.stringify(connInfo))
    console.log(WebsocketEventHandler.clients);
  }
  onClose(evt: CloseEvent, ws: WSContext<WebSocket>): void {
    const uuid = this.ctx.get("clientId");
    WebsocketEventHandler.clients.delete(uuid);
    console.log("connection closed");
    console.log(WebsocketEventHandler.clients);

  }
  onMessage(evt: MessageEvent<WSMessageReceive>, ws: WSContext<WebSocket>): void {
    
    try {
      const json: WebsocketEventPayload = JSON.parse(evt.data.toString());
      console.log("message", json);
      const own_id = this.ctx.get("clientId");
      switch (processWebsocketMessage(json)) {
        case WebsocketMessageDecision.Broadcast:
          if (json.type == WebsocketEvent.MidiEvent) {
            WebsocketApplication.driver.sendMidi(json.data);
          }
          WebsocketEventHandler.broadcast(json, [own_id]);
          break;

        // send message back (for acks or something)
        case WebsocketMessageDecision.Disconnect:
          WebsocketEventHandler.direct(json, own_id);
          ws.close();
          break;
      }

    } catch (e) {
      console.error(e);
      ws.send(String(e));
    }
  }

  static broadcast(msg: WebsocketEventPayload, except: string[]) {
    const e = new Set(except);
    for (const id of WebsocketEventHandler.clients.keys()) {
      if (e.has(id)) continue;

      WebsocketEventHandler.direct(msg, id);
    }
  }

  static direct(msg: WebsocketEventPayload, receiver: string) {
    const s = WebsocketEventHandler.clients.get(receiver);
    s?.send(JSON.stringify(msg));
  }
}

/**
 * Decides what the server should do next
 * @param msg 
 * @returns 
 */
function processWebsocketMessage(msg: WebsocketEventPayload): WebsocketMessageDecision {
  console.log(msg);
  switch (msg.type) {
    case WebsocketEvent.ConnectionInformation:
      throw new Error("client cant send connection information");
    case WebsocketEvent.MidiEvent:
      return WebsocketMessageDecision.Broadcast
  }
}

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
    })

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