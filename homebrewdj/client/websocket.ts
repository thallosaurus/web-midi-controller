import { ClientNumberPayload, ConnectedPayload } from "./protocol.ts";

export type WebsocketMessageCallback<T> = (id: string, msg: T) => void;

const isConnectionMessage = (msg: { type: "connection" }): msg is ConnectedPayload => msg.type === "connection"
const isClientNumberPayload = (msg: { type: "clientnumber"}): msg is ClientNumberPayload => msg.type == "clientnumber"
const isWebsocketConnected = (ws: WebSocket | null): ws is WebSocket => (ws !== null && ws.readyState == WebSocket.OPEN)

interface ConnectRequest {
    endpoint: URL,
    open?: (p: ConnectedPayload) => void,
    close?: () => void
}

export class WebsocketClient<T> {
    private ws: WebSocket | null = null
    private _id: string | null = null
    private clientNumber: number | null = null

    private handler: WebsocketMessageCallback<T>
    private connectionIdHandler: ((id: string | null) => void) | null = null

    private outCounter = 0
    private inCounter = 0

    get id() {
        return this._id;
    }

    asyncConnect(endpoint: URL): Promise<ConnectedPayload> {
        return new Promise((open, close) => {
            this.connect({
                endpoint,
                open,
                close
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

    connect({ endpoint, open, close }: ConnectRequest) {
        const ws = new WebSocket(endpoint);
        ws.onopen = (ev) => {
            this.inCounter = 0;
            this.outCounter = 0;
            console.log("connection established", ev);
        }
        ws.onmessage = ({ data }) => {
            const msg = JSON.parse(data);
            if (isConnectionMessage(msg)) {
                this._id = msg.id;
                this.clientNumber = msg.clientNumber;
                console.log(msg);

                if (this.connectionIdHandler) {
                    this.connectionIdHandler(msg.id);
                }
                if (open) open(msg);
                return;

            }

            if (isClientNumberPayload(msg)) {
                this.clientNumber = msg.clientNumber;
                return
            }
            this.handler(msg.id, msg)
            this.inCounter++;

        }
        ws.onclose = (ev) => {
            console.log("connection closed", ev);
            if (close) close();
        }
        ws.onerror = (ev) => {
            console.log("connection error", ev);
            if (close) close();
        }
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
            this.ws.send(JSON.stringify({ ...data, "timestamp": performance.now(), packetNum: this.outCounter }))
            this.outCounter++;
        }
    }
}