import { ConnectedPayload } from "./protocol.ts";

export type WebsocketMessageCallback<T> = (id: string, msg: T) => void;

/*export function asyncWebsocketClient<T>(endpoint: URL, handler: WebsocketMessageCallback<T>) {
    return new Promise((res, rej) => {
        return new WebsocketClient<T>(endpoint, handler, res, rej);
    })
}*/

const isConnectionMessage = (msg: { type: "connection" }): msg is ConnectedPayload => {
    return msg.type === "connection"
}

const isWebsocketConnected = (ws: WebSocket | null): ws is WebSocket => {
    return (ws !== null && ws.readyState == WebSocket.OPEN)
}

interface ConnectRequest {
    endpoint: URL,
    open?: (id: string) => void,
    close?: (reason?: string) => void
}

export class WebsocketClient<T> {
    private ws: WebSocket | null = null
    private _id: string | null = null
    handler: WebsocketMessageCallback<T>
    connectionIdHandler: ((id: string | null) => void) | null = null

    get id() {
        return this._id;
    }

    asyncConnect(endpoint: URL): Promise<string> {
        return new Promise((open, rej) => {
            this.connect({
                endpoint,
                open
            })
        })
    }

    disconnect() {
        if (isWebsocketConnected(this.ws)) {
            this.ws.close();
            if (this.connectionIdHandler) {
                this.connectionIdHandler(null);
            }
        }
    }

    connect({ endpoint, open }: ConnectRequest) {
        const ws = new WebSocket(endpoint);
        ws.onopen = (ev) => {
            console.log("connection established", ev);
        }
        ws.onmessage = ({ data }) => {
            const msg = JSON.parse(data);
            if (isConnectionMessage(msg)) {
                this._id = msg.id;
                if (this.connectionIdHandler) {
                    this.connectionIdHandler(msg.id);
                }
                if (open) open(msg.id);
                return;
            } else {
                this.handler(msg.id, msg)
            }

        }
        ws.onclose = (ev) => console.log("connection closed", ev);
        ws.onerror = (ev) => console.log("connection error", ev);
        this.ws = ws;
    }

    constructor(
        handler: WebsocketMessageCallback<T>,
        connectionIdHandler: ((id: string | null) => void) | null = null,
    ) {
        this.handler = handler;
        this.connectionIdHandler = connectionIdHandler;
        //const ws = new WebSocket(endpoint);
        //handler(ws);
    }

    send(data: T) {
        if (isWebsocketConnected(this.ws)) {
            this.ws.send(JSON.stringify({ ...data }))
        }
    }
}