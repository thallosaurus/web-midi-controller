import { WebsocketClient, AllowedPayloads } from "@hdj/homebrewdj-web-client";
import { Outgoing, WCallbacks } from "@hdj/widgets";
import { createContext, useState, useContext } from "react";

export class EventBus extends WCallbacks {
    sender: Outgoing | null = null;

    setSender(sender: Outgoing) {
        this.sender = sender;
    }
}


export const WebsocketContext = createContext<WebsocketClient<AllowedPayloads> | null>(null);
export function useWebsocketContext() {
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const ctx = useContext(WebsocketContext);
  if (!ctx) throw new Error("no websocket loaded")
  return {
    connected: () => {
      return connectionId !== null
    },
    //connectionId,
    connect: async (uri: URL) => {
      const id = await ctx.asyncConnect(uri);
      setConnectionId(id);
    },
    disconnect: () => {
      ctx.disconnect();
      setConnectionId(null);
    },
    ws: ctx
  };
}