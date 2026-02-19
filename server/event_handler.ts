import { WSContext, WSEvents, WSMessageReceive } from "@hono/hono/ws";
import { Context } from "@hono/hono";
import {
  createWebsocketConnectionInfoPayload,
  WebsocketServerMessage,
} from "./messages.ts";
import { CoreServerState } from "./state.ts";

export type WSState = {
  clientId: string;
};

export class WebsocketEventHandler implements WSEvents<WebSocket> {
  static clients: Map<string, WebSocket> = new Map();
  ctx: Context;
  state: CoreServerState;
  id = crypto.randomUUID();
  ws: WSContext<WebSocket> | null = null
  constructor(
    c: Context<{ Variables: WSState }, any, {}>,
    state: CoreServerState,
  ) {
    this.ctx = c;
    this.state = state;
  }
  sendConnectionInfo() {
    const connInfo = createWebsocketConnectionInfoPayload(this.id);
    this.ws!.send(JSON.stringify(connInfo));
  }
  onOpen(evt: Event, ws: WSContext<WebSocket>): void {
    this.ws = ws;

    //c.set("clientId", connInfo.connectionId);
    //this.ctx.set("clientId", connInfo.connectionId);
    WebsocketEventHandler.clients.set(this.id, this.ws.raw!);
    this.sendConnectionInfo();
    //console.log(WebsocketEventHandler.clients);
  }
  onClose(evt: CloseEvent, ws: WSContext<WebSocket>): void {
    WebsocketEventHandler.clients.delete(this.id);
    console.log("connection closed");
    //console.log(WebsocketEventHandler.clients);
    this.ws = null;
  }
  onMessage(
    evt: MessageEvent<WSMessageReceive>,
    ws: WSContext<WebSocket>,
  ): void {
    try {
      const json: WebsocketServerMessage = JSON.parse(evt.data.toString());
      const own_id = this.ctx.get("clientId");
      switch (json.type) {
        case "midi-data":
          this.state.inputData(json.data);
          break;
      }
    } catch (e) {
      console.error(e);
      ws.send(String(e));
    }
  }

  static disconnectAll() {
    WebsocketEventHandler.broadcast({
      type: "close"
    }, []);
  }

  static broadcast(msg: WebsocketServerMessage, except: string[]) {
    const e = new Set(except);
    for (const id of WebsocketEventHandler.clients.keys()) {
      if (e.has(id)) continue;
      console.log("broadcasting to", id, msg);
      WebsocketEventHandler.direct(msg, id);
    }
  }

  static direct(msg: WebsocketServerMessage, receiver: string) {
    const s = WebsocketEventHandler.clients.get(receiver);
    s?.send(JSON.stringify(msg));
  }
}
