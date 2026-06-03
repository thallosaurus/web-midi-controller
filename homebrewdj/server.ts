import { randomUUID, UUID } from "node:crypto";
import { Router, Context, Application } from "oak";

interface NoteMessagePayload {
    channel: number,
    note: number,
    velocity: number,
    on: boolean
}

interface CCMessagePayload {
    channel: number,
    cc: number,
    value: number
}

export type SendNoteCallback = (payload: NoteMessagePayload) => void;
export type SendCCCallback = (payload: CCMessagePayload) => void;
type HandlerCallback<T> = (msg: T) => void;

const StaticHandler = async (context: Context) => {
    await context.send({
        root: `${Deno.cwd()}`,
        index: "index.html"
    })
}

type ServerCallbacks = {
    handleMessage: <T>(msg: T) => void;
}

const WebsocketHandler = <T>(clients: Map<UUID, WebSocket>, ws: WebSocket, callback: HandlerCallback<T>) => {
    const id = randomUUID();

    ws.addEventListener("open", (ev) => {
        console.log("open", id);
        ws.send(JSON.stringify({
            type: "connection",
            id
        }))
        console.log(clients);
    })

    ws.addEventListener("message", (ev) => {
        //console.log("message", id, ev.data);
        callback(ev.data);
    })

    ws.addEventListener("error", (ev) => {
        console.log("error", ev);
    })

    ws.addEventListener("close", (ev) => {
        console.log("close", id)
        clients.delete(id);
        console.log(clients);
    })

    return id;
}

export const WebsocketRouter = <T>(clients: Map<UUID, WebSocket>, callback: HandlerCallback<T>) => {
    const router = new Router();
    router.get("/ws", (ctx) => {
        if (!ctx.isUpgradable) {
            ctx.throw(501);
        }

        const ws = ctx.upgrade();
        const id = WebsocketHandler(clients, ws, callback);
        clients.set(id, ws);
    })
    router.get("/", StaticHandler)

    return router;
}

export class Server<T> {
    controller: AbortController;
    app: Application;
    clients = new Map();

    constructor(callback: HandlerCallback<T>, app = new Application(), controller = new AbortController()) {
        this.app = app;
        this.controller = controller;

        const ws = WebsocketRouter(this.clients, callback);
        this.app.use(ws.routes());
        this.app.use(ws.allowedMethods());
        this.app.listen({
            hostname: "127.0.0.1",
            port: 8080,
            signal: this.controller.signal
        })
    }

    close() {
        this.controller.abort();
    }
}