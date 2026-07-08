import { Overlay } from "@hdj/definitions";
import { WebsocketClient, AllowedPayloads, WebsocketMessageCallback, ConnectedPayload, ClientNumberPayload } from "@hdj/homebrewdj-web-client";
import { CCDelta, NoteDelta, OscDelta, Outgoing, PgrmDelta, WCallbacks } from "@hdj/widgets";
import { createContext, useState, useContext, useRef, ReactNode, useEffect } from "react";
import { EventBus, ProgramChangeHandler } from "./EventBus";

type WebsocketContextType = {
    ws: WebsocketClient<AllowedPayloads>,
    bus: EventBus,
    connectionState: ConnectionState,
    connectionId: string | null,
    clientId: number | null,
    setProgramChangeHandler: (handler: ProgramChangeHandler | null) => void,
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
    const [clientId, setClientId] = useState<number | null>(null);
    const [connectionState, setConnectionState] = useState(ConnectionState.Offline);
    const bus = useContext(EventBusContext);
    const wsRef = useRef(new WebsocketClient<AllowedPayloads>((id: string, msg: AllowedPayloads) => {
        //console.log("wsRef", msg);
        //if (msg.type == "clientnumber") {
        //setClientId(msg.clientNumber);
        bus.extInput(msg);
        //}
    }))
    useEffect(() => {
        bus.setSender(wsRef.current);
        bus.setProgramChangeHandler((n) => console.log("switching to ", n))
        return () => {
            bus.setSender(null);
            bus.setProgramChangeHandler(null)
        }
    }, [])

    return <WebsocketContext.Provider value={{
        ws: wsRef.current,
        bus,
        connectionId,
        connectionState,
        clientId,
        setProgramChangeHandler: (handler: ProgramChangeHandler | null) => {
            bus.setProgramChangeHandler(handler);
        },
        connect: async (uri) => {
            setConnectionState(ConnectionState.Connecting);
            await new Promise((res, rej) => {
                wsRef.current.connect({
                    endpoint: uri,
                    open: (p: ConnectedPayload) => {
                        setConnectionId(p.id)
                        setClientId(p.clientNumber)
                        console.log(p);
                        setConnectionState(ConnectionState.Online);
                        res(p.id)
                    },
                    close: () => {
                        setConnectionId(null);
                        setConnectionState(ConnectionState.Offline);
                        setClientId(null)
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