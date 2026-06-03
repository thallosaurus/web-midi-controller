//import { AllowedPayloads } from "../server";

import { AllowedPayloads } from "./protocol.ts";

type WebsocketMessageCallback<T> = (msg: T) => void;

export class WebsocketClient<T = AllowedPayloads> {
    private ws: WebSocket
    constructor(endpoint: URL, handler: WebsocketMessageCallback<T> = console.log) {
        const ws = new WebSocket(endpoint);
        //handler(ws);

        ws.addEventListener("open", (ev) => {
            console.log(ev);
        })

        ws.addEventListener("close", (ev) => {
            console.log(ev);
        })

        ws.addEventListener("message", (ev) => {
            //console.log(JSON.parse(ev.data) as T);
            handler(JSON.parse(ev.data))
        })

        ws.addEventListener("error", (ev) => {
            console.log(ev);
        })
        this.ws = ws;
    }

    send(data: T) {
        if (this.ws.readyState == this.ws.OPEN) {
            this.ws.send(JSON.stringify({ ...data }))
        }
    }
}