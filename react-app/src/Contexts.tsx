import { WebsocketClient, AllowedPayloads, WebsocketMessageCallback } from "@hdj/homebrewdj-web-client";
import { Outgoing, WCallbacks } from "@hdj/widgets";
import { createContext, useState, useContext, useRef, ReactNode, useEffect } from "react";

export class EventBus extends WCallbacks {
    sender: Outgoing | null = null;

    setSender(sender: Outgoing | null) {
        this.sender = sender;
    }
}

type WebsocketContextType = {
    ws: WebsocketClient<AllowedPayloads>,
    bus: EventBus,
    connectionState: ConnectionState,
    connectionId: string | null,
    connect: (uri: URL) => Promise<void>;
    disconnect: () => void;
}

export const EventBusContext = createContext<EventBus>(new EventBus());
export const WebsocketContext = createContext<WebsocketContextType | null>(null);
export function useWebsocketContext() {
    const ctx = useContext(WebsocketContext);
    if (!ctx) throw new Error("no websocketcontext loaded")
    return ctx;
}

enum ConnectionState {
    Offline = "disconnected",
    Connecting = "connecting",
    Online = "connected"
}


export const WebsocketProvider = ({ children }: { children: ReactNode }) => {
    
    const [connectionId, setConnectionId] = useState<string | null>(null);
    const [connectionState, setConnectionState] = useState(ConnectionState.Offline);
    const bus = useContext(EventBusContext);
    const wsRef = useRef(new WebsocketClient<AllowedPayloads>((id: string, msg: AllowedPayloads) => {
        bus.extInput(msg);
    }))
    useEffect(() => {
        bus.setSender(wsRef.current);
        return () => {
            bus.setSender(null);
        }
    }, [])

    return <WebsocketContext.Provider value={{
        ws: wsRef.current,
        bus,
        connectionId,
        connectionState,
        connect: async (uri) => {
            setConnectionState(ConnectionState.Connecting);
            await new Promise((res, rej) => {
                wsRef.current.connect({
                    endpoint: uri,
                    open: (id) => {
                        setConnectionId(id)
                        setConnectionState(ConnectionState.Online);
                        res(id)
                    },
                    close: () => {
                        setConnectionId(null);
                        setConnectionState(ConnectionState.Offline);
                        rej();
                    }
                })
            })
            //const id = await wsRef.current.asyncConnect(uri);
        },
        disconnect: () => {
            wsRef.current.disconnect();
            setConnectionId(null);
            setConnectionState(ConnectionState.Offline);
        }
    }}>{children}</WebsocketContext.Provider>
}