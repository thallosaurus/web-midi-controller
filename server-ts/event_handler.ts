import { WSContext, WSEvents, WSMessageReceive } from "@hono/hono/ws";
import { Context } from "@hono/hono";
import { createWebsocketConnectionInfoPayload, WebsocketServerMessage } from "./messages.ts";
import { CoreServerState } from "./state.ts";

export type WSState = {
  clientId: string
};

export class WebsocketEventHandler implements WSEvents<WebSocket> {
  static clients: Map<string, WebSocket> = new Map();
  ctx: Context
  state: CoreServerState
  constructor(c: Context<{ Variables: WSState }, any, {}>, state: CoreServerState) {
    this.ctx = c;
    this.state = state
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
      const own_id = this.ctx.get("clientId");
      switch (json.type) {
        case "midi-data":
          this.state.inputData(json.data, own_id);
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