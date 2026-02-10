import { WSContext, WSEvents, WSMessageReceive } from "@hono/hono/ws";
import { Context } from "@hono/hono";
import { createWebsocketConnectionInfoPayload, WebsocketServerMessage } from "./messages.ts";

export type WSState = {
  clientId: string
};

enum WebsocketMessageDecision {
  Broadcast,
  Disconnect
}

export class WebsocketEventHandler implements WSEvents<WebSocket> {
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
      const json: WebsocketServerMessage = JSON.parse(evt.data.toString());
      console.log("message", json);
      const own_id = this.ctx.get("clientId");
      switch (processWebsocketMessage(json)) {
        case WebsocketMessageDecision.Broadcast:
          /*
          if (json.type == WebsocketEvent.MidiEvent) {
            WebsocketApplication.driver.sendMidi(json.data);
          }
          WebsocketEventHandler.broadcast(json, [own_id]);
          break;
          */

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

  static broadcast(msg: WebsocketServerMessage, except: string[]) {
    const e = new Set(except);
    for (const id of WebsocketEventHandler.clients.keys()) {
      if (e.has(id)) continue;

      WebsocketEventHandler.direct(msg, id);
    }
  }

  static direct(msg: WebsocketServerMessage, receiver: string) {
    const s = WebsocketEventHandler.clients.get(receiver);
    s?.send(JSON.stringify(msg));
  }
}

/**
 * Decides what the server should do next
 * @param msg 
 * @returns 
 */
function processWebsocketMessage(msg: WebsocketServerMessage): WebsocketMessageDecision {
  console.log(msg);
  switch (msg.type) {
    case "connection-information":
      throw new Error("client cant send connection information");
    case "midi-event":
      return WebsocketMessageDecision.Broadcast
  }
}