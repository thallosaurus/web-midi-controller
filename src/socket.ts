import { upgradeWebSocket } from "hono/deno";
import { midi_out, send_cc_update } from "./midi.ts";
import { CCEvent } from "../web/src/events.ts";

type Client = {
  id: string;
  ws: WebSocket;
};

const clients = new Map<WebSocket, Client>();

export function get_connection_id(ws: WebSocket): string {
  const client = clients.get(ws);
  if (!client) {
    throw new Error("connection has no id")
  }

  return client.id
}

export function broadcast(data: string, except: Array<string>) {
  const filtered = clients.entries().filter(([_ws, client], i) => {
    //console.log("except", client.id, except)
    return !except.includes(client.id);
  });
  for (const [ws, client] of filtered) {
    console.log("sending to id " + client.id);
    ws.send(data);
  }
}

export const websocketMiddleware = upgradeWebSocket((c) => {
  return {
    onOpen(_event, ws) {
      const id = crypto.randomUUID();
      const raw = ws.raw as WebSocket;
      clients.set(raw, {
        id,
        ws: raw,
      });

      console.log(clients);
    },
    onMessage(event, ws) {
      const id = get_connection_id(ws.raw as WebSocket);
      if (id) {
        //console.log(`Message from client: ${event.data}`);
        const data = JSON.parse(String(event.data));
        switch (data.event_name) {
          case "ccupdate":
            {
              console.log(data);
              const d = data as CCEvent;
              send_cc_update(d);
              broadcast(JSON.stringify(d), [id!]);
            }
            break;
        }
      } else {
        console.error("socket has no id");
        ws.close();
      }
      //console.log(data);
      //ws.send("Hello from server");
    },
    onClose(_event, ws) {
      const raw = ws.raw as WebSocket;
      const client = clients.get(raw);
      if (!client) return;

      clients.delete(raw);
      console.log(clients);
    },
  };
});
