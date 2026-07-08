import { randomUUID, UUID } from "node:crypto";
import { Router, Context, Application } from "oak";
import { AllowedPayloads } from "./client/protocol.ts";
import { StaticAssets } from "./static.ts";
import { CCPayload, MidiMessage } from "@hdj/midi-driver";
import { MidiDriver } from "@hdj/midi-driver/ffi";
import { OscDriver } from "./osc.ts";

//const isProgramChangeBank(msg: MidiMessage): def is 

/**
 * Callback invoked when a message is received from a connected client.
 */
type HandlerCallback<T> = (msg: T) => void;

type WebSocketClientMap = { map: Map<UUID, { ws: WebSocket, clientNumber: number }>, nextClientNumber: number };

export const isSystemMessage = (msg: MidiMessage, systemChannel: number) => {
    return (
        msg.type == "NoteOn"
        || msg.type == "NoteOff"
        || msg.type == "ControlChange"
        || msg.type == "ProgramChange"
    ) && msg.channel == systemChannel
}

export const isClientSelectorBank = (t: MidiMessage): boolean => {
    return t.type == "ControlChange" && t.cc === 0
}

export const isClientSelectorSub = (t: MidiMessage): boolean => {
    return t.type == "ControlChange" && t.cc === 32
}

/**
 * Serves the web application's static assets.
 *
 * @param context Oak request context.
 */
const StaticHandler = async (context: Context) => {
    //console.log(new URL(StaticAssets, import.meta.url).pathname)
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
const WebsocketHandler = <T>(server: Server<T>, ws: WebSocket, callback: HandlerCallback<T>) => {
    const id = randomUUID();

    ws.addEventListener("open", (ev) => {
        console.log("new websocket connection with id", id);
        server.clients.map.set(id, { ws, clientNumber: server.clients.nextClientNumber });

        ws.send(JSON.stringify({
            type: "connection",
            id,
            clientNumber: server.clients.nextClientNumber
        }))
        server.clientSelector.addClient(id);
        console.log(server.clientSelector);
        //clients.nextClientNumber++;
        //console.log(clients);
    })

    ws.addEventListener("message", (ev) => {
        console.log("message", id, ev.data);
        callback(JSON.parse(ev.data));
    })

    ws.addEventListener("error", (v) => {
        console.log("error", (v as ErrorEvent).error);
        server.clients.map.delete(id);
    })

    ws.addEventListener("close", (ev) => {
        //console.log("close", id)
        server.clients.map.delete(id);
        server.clientSelector.removeClient(id)
    })

    return id;
}

/**
 * Creates a router that exposes static assets and a WebSocket endpoint.
 *
 * @param clients Active client registry.
 * @param callback Message handler invoked for incoming payloads.
 */
export const WebsocketRouter = <T>(server: Server<T>, callback: HandlerCallback<T>) => {
    const router = new Router();
    router.get("/ws", (ctx) => {
        if (!ctx.isUpgradable) {
            ctx.throw(501);
        }

        const ws = ctx.upgrade();
        const id = WebsocketHandler(server, ws, callback);
        //clients.nextClientNumber++;
    })
    router.get("/", StaticHandler)
    router.get("/manifest.json", StaticHandler)
    router.get("/assets/:file", StaticHandler)
    router.get("/icons/:file", StaticHandler)

    return router;
}

interface ListenOptions {
    port?: number,
    hostname?: string,
    systemChannel?: number
}

class ClientSelector {
    clients: Map<number, UUID> = new Map();
    currentClientId = 0;

    // gets incremented if client gets added
    nextClientNumber = 0;

    setBank(n: number) {
        this.currentClientId = n;
    }

    setSub(n: number) { }

    // brittle, but ok for now
    addClient(id: UUID) {
        this.clients.set(this.nextClientNumber, id)
        this.nextClientNumber++;
    }

    removeClient(id: UUID) {
        this.findClientByUUID(id, (n) => {
            this.clients.delete(n);
        })
    }
    private findClientByUUID(id: UUID, fn: (n: number) => void) {
        for (const [index, uuid] of this.clients.entries()) {
            if (uuid === id) {
                fn(index);
                return;
            }
        }
        throw new Error(`${id} not found`)
    }

    reorderId(newIndex: number, id: UUID) {
        if (this.clients.has(newIndex)) throw new Error("newIndex is already taken")
        this.removeClient(id);
        this.clients.set(newIndex, id);
    }

    getIndex(num: number): UUID | null {
        if (this.clients.has(num)) {
            return this.clients.get(num)!
        } else {
            return null;
        }
    }
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
    clients: WebSocketClientMap = { map: new Map<UUID, { ws: WebSocket, clientNumber: number }>(), nextClientNumber: 0 };

    clientSelector = new ClientSelector();
    //selectedClientNumber = 0;

    // 1-index based system channel
    //private systemMidiChannel: number;

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

        //this.systemMidiChannel = listenOptions.systemChannel ?? 16;

        const ws = WebsocketRouter(this, callback);
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
        this.clients.map.forEach(client => {
            //client.ws.send(JSON.stringify(msg))
            this.sendToSocket(client.ws, msg);
        });
    }

    private sendToId(id: UUID, msg: T) {
        const i = this.clients.map.get(id);
        if (i) this.sendToSocket(i.ws, msg);
    }

    private sendToSocket(client: WebSocket, msg: T) {
        client.send(JSON.stringify(msg));
    }

    sendToClient(num: number, msg: T) {
        //const client = this.getClientByNumber(num);
        const i = this.clientSelector.getIndex(num);
        if (i) {
            this.sendToId(i, msg);
        }
    }

    /**
     * Stops the server and terminates all active listeners.
     */
    close() {
        this.controller.abort();
    }

    /**
     * 
     * @param msg 
     * @returns true if the processing should continue and forward it to clients, if applicable
     */
    processSystemMessage(msg: MidiMessage): boolean {
        if (isClientSelectorBank(msg)) {
            const m = msg as CCPayload;
            this.clientSelector.setBank(m.value);
            //this.selectedClientNumber = m.value;
            console.log(this);
            return false;
        }
        if (isClientSelectorSub(msg)) {
            const m = msg as CCPayload;
            this.clientSelector.setSub(m.value);
            //this.selectedClientNumber = m.value;
            return false;
        }
        return true;
    }
}

interface WebsocketForwardOptions {
    msg: AllowedPayloads,
    server: Server,
    midiPort: MidiDriver,
    oscPort: OscDriver
}
export const forwardWebsocketMessageToPorts = ({ msg, server, midiPort, oscPort }: WebsocketForwardOptions) => {
    //console.debug("websocket payload", msg);
    switch (msg.type) {
        case "cc":
            {
                const m: MidiMessage = {
                    type: "ControlChange",
                    cc: msg.cc,
                    channel: msg.channel,
                    value: msg.value
                };

                midiPort.sendMidi(m)
                server.broadcast({
                    ...m,
                    type: "cc"
                })
            }
            break;
        case "note":
            {
                const m = {
                    channel: msg.channel,
                    note: msg.note,
                    velocity: msg.velocity
                };

                if (msg.velocity > 0) {
                    midiPort.sendMidi({
                        type: "NoteOn",
                        ...m
                    });
                } else {
                    midiPort.sendMidi({
                        type: "NoteOff",
                        ...m
                    });
                }
                server.broadcast({
                    type: "note",
                    ...m
                })
            }
            break;

        case "osc":
            //console.log(msg);
            oscPort.send(msg)
            server.broadcast(msg)
            break;
    }
}

interface MidiForwardOptions {
    t: MidiMessage,
    server: Server,
    systemChannel: number
}
export const forwardMidiToServer = ({ t, server, systemChannel }: MidiForwardOptions) => {
    console.debug("midiport payload", t);

    switch (t.type) {
        case "NoteOn":
        case "NoteOff":
            server.broadcast({
                type: "note",
                channel: t.channel,
                note: t.note,
                //on: t.type == "NoteOn",
                velocity: t.velocity
            });
            break;
        case "ControlChange":
            if (isSystemMessage(t, systemChannel)) {
                if (!server.processSystemMessage(t)) return;
            }

            server.broadcast({
                type: "cc",
                channel: t.channel,
                cc: t.cc,
                value: t.value
            });
            break;

        case "ProgramChange":
            //console.log(t);
            // ableton sends bank as cc 0,
            // sub as cc 32
            // and the program as programchange
            {
                if (isSystemMessage(t, systemChannel)) {
                    server.sendToClient(server.clientSelector.currentClientId, {
                        type: "pgrm",
                        value: t.value
                    });
                }
            }
            break;
    }
}