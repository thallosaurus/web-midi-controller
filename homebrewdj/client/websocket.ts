import { AllowedPayloads, ConnectedPayload } from "./protocol.ts";

type WebsocketMessageCallback<T> = (msg: T) => void;

export function asyncWebsocketClient<T>(endpoint: URL, handler: WebsocketMessageCallback<T>) {
    return new Promise((res, rej) => {
        return new WebsocketClient<T>(endpoint, handler, res, rej);
    })
}

export class WebsocketClient<T = AllowedPayloads> {
    private ws: WebSocket
    private id: string | null = null

    constructor(endpoint: URL, 
        handler: WebsocketMessageCallback<T>,
        open?: (id: string) => void,
        close?: (reason?: string) => void
    ) {
        const ws = new WebSocket(endpoint);
        //handler(ws);

        ws.addEventListener("open", (ev) => {
            console.log(ev);
            const evt = (ev as CustomEvent<ConnectedPayload>).detail;
            if (evt.type == "connection") {
                this.id = evt.id
                if (open) open(evt.id)
            }
        })

        ws.addEventListener("close", (ev) => {
            this.id = null;
            if (close) close(ev.reason);
        })

        ws.addEventListener("message", (ev) => {
            handler(JSON.parse(ev.data))
        })

        ws.addEventListener("error", (ev) => {
            console.log(ev);
            if (close) close()
        })
        this.ws = ws;
    }

    send(data: T) {
        if (this.ws.readyState == this.ws.OPEN) {
            this.ws.send(JSON.stringify({ ...data }))
        }
    }
}