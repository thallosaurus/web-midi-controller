import { Context, Hono } from '@hono/hono'
import { upgradeWebSocket } from '@hono/hono/deno'
import { MidiDriver } from "@driver";
import { createMidiEventPayload, createWebsocketConnectionInfoPayload, WebsocketEvent, WebsocketEventPayload } from "./messages.ts";
import { WSContext, WSEvents, WSMessageReceive } from "@hono/hono/ws";

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
    console.log("message: " + evt.data);

    try {
      const json: WebsocketEventPayload = JSON.parse(evt.data.toString());
      const own_id = this.ctx.get("clientId");
      switch (processWebsocketMessage(json)) {
        case WebsocketMessageDecision.Broadcast:
          switch (json.type) {
            case WebsocketEvent.MidiEvent:
              WebsocketApplication.driver.sendMidi(json.data);
              /* falls through */
            default:
              WebsocketEventHandler.broadcast(json, [own_id]);
              break;
          }
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
  switch(msg.type) {
    case WebsocketEvent.ConnectionInformation:
      throw new Error("client cant send connection information");
    case WebsocketEvent.MidiEvent:
      return WebsocketMessageDecision.Broadcast
  }
}

class WebsocketApplication {
  app = new Hono<{ Variables: WSState }>();
  static driver = new MidiDriver();

  constructor() {
    this.app.get("/ws", upgradeWebSocket((c) => {
      return new WebsocketEventHandler(c);
    }));

    // frontend
    this.app.get("/", (c) => {
      return c.text("hello world")
    })

    WebsocketApplication.driver.emitter.addEventListener("data", (ev) => {
      const evt = ev as CustomEvent;
      console.log(evt.detail);

      const midiEvent = createMidiEventPayload(evt.detail);

      WebsocketEventHandler.broadcast(midiEvent, [])
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