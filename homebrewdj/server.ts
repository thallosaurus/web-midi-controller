import { randomUUID, UUID } from "node:crypto";
import { Router, Context, Application } from "oak";
import { AllowedPayloads } from "./client/protocol.ts";
import { StaticAssets } from "./static.ts";

/**
 * Callback invoked when a message is received from a connected client.
 */
type HandlerCallback<T> = (msg: T) => void;

/**
 * Serves the web application's static assets.
 *
 * @param context Oak request context.
 */
const StaticHandler = async (context: Context) => {
    console.log(new URL(StaticAssets, import.meta.url).pathname)
    await context.send({
        root: new URL(StaticAssets, import.meta.url).pathname,
        index: "index.html",
    })
}

/**
 * Registers WebSocket event handlers for a newly connected client.
 *
 * @param clients Active client registry.
 * @param ws Connected WebSocket instance.
 * @param callback Message handler invoked for incoming payloads.
 * @returns Unique identifier assigned to the connection.
 */
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
        callback(JSON.parse(ev.data));
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

/**
 * Creates a router that exposes static assets and a WebSocket endpoint.
 *
 * @param clients Active client registry.
 * @param callback Message handler invoked for incoming payloads.
 */
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
    router.get("/manifest.json", StaticHandler)
    router.get("/assets/:file", StaticHandler)

    return router;
}

interface ListenOptions {
    port?: number,
    hostname?: string
}

/**
 * Lightweight HTTP and WebSocket server used by HomebrewDJ.
 *
 * Provides static file hosting, client connection management and
 * message broadcasting facilities.
 */
export class Server<T = AllowedPayloads> {
    controller: AbortController;
    app: Application;
    clients = new Map<UUID, WebSocket>();

    /**
     * Creates and starts a new server instance.
     *
     * @param callback Handler invoked for messages received from clients.
     * @param listenOptions Additional application listen options.
     * @param app Oak application instance.
     * @param controller Abort controller used to stop the server.
     */
    constructor(callback: HandlerCallback<T>, listenOptions: ListenOptions = {}, app = new Application(), controller = new AbortController()) {
        this.app = app;
        this.controller = controller;

        const ws = WebsocketRouter(this.clients, callback);
        this.app.use(ws.routes());
        this.app.use(ws.allowedMethods());
        this.app.addEventListener("listen", (e) => {
            console.log("listening to", listenOptions.port ?? 8080)
        });
        
        this.app.listen({
            // default is localhost only for development, but can be overridden in listenOptions
            hostname: "127.0.0.1",
            port: 8080,
            signal: this.controller.signal,
            ...listenOptions
        });
    }

    /**
     * Sends a message to all connected WebSocket clients.
     *
     * @param msg Payload to broadcast.
     */
    broadcast(msg: T) {
        this.clients.forEach(client => {
            client.send(JSON.stringify(msg))
        });
    }

    /**
     * Stops the server and terminates all active listeners.
     */
    close() {
        this.controller.abort();
    }
}