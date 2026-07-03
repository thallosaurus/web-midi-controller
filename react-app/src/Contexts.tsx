import { WebsocketClient, AllowedPayloads, WebsocketMessageCallback } from "@hdj/homebrewdj-web-client";
import { Outgoing, WCallbacks } from "@hdj/widgets";
import { createContext, useState, useContext, useRef, ReactNode } from "react";

export class EventBus extends WCallbacks {
    sender: Outgoing | null = null;

    setSender(sender: Outgoing | null) {
        this.sender = sender;
    }
}

type WebsocketContextType = {
    ws: WebsocketClient<AllowedPayloads>,
    connected: boolean,
    connectionId: string | null,
    connect: (uri: URL) => Promise<void>;
    disconnect: () => void;
}
export const WebsocketContext = createContext<WebsocketContextType| null>(null);
export function useWebsocketContext() {
    const ctx = useContext(WebsocketContext);
    if (!ctx) throw new Error("no websocketcontext loaded")
        return ctx;
}

export const WebsocketProvider = ({ children, messageHandler }: { children: ReactNode, messageHandler: WebsocketMessageCallback<AllowedPayloads>}) => {
    const wsRef = useRef(new WebsocketClient<AllowedPayloads>(messageHandler))
    
    const [connected, setConnected] = useState(false);
    const [connectionId, setConnectionId] = useState<string | null>(null);

    return <WebsocketContext.Provider value={{
        ws: wsRef.current,
        connected,
        connectionId,
        connect: async (uri) => {
            const id = await wsRef.current.asyncConnect(uri);
            setConnectionId(id);
            setConnected(true);
        },
        disconnect: () => {
            wsRef.current.disconnect();
            setConnectionId(null);
            setConnected(false);
        }
    }}>{children}</WebsocketContext.Provider>
}