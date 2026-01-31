import { MidiEvent } from "../common/events.ts";
import { sendDisconnected, sendFrontendMidiEvent, sendMidiEvent } from "./message.ts";

export const wsUri = "ws://" + location.hostname + ":8888/ws";

let ws: WebSocket | null = null;
//let connecting: Promise<WebSocket> | null = null;
let reconnect = true;
let backoff = 250;
const BACKOFF_MAX = 5000;

function scheduleReconnect() {
    setTimeout(() => {
        connect(wsUri).catch(() => { });
        backoff = Math.min(backoff * 2, BACKOFF_MAX);
    }, backoff)
}

function setupSocket(socket: WebSocket): WebSocket {

    // Listen for incoming websocket messages from the backend
    socket.addEventListener("message", (e) => {
        const msg: MidiEvent = JSON.parse(e.data);
        switch (msg.event_name) {
            case "noteupdate":
                console.log("external noteupdate data", msg);
                //sendFrontendMidiEvent(msg);
                sendMidiEvent(msg);
            break;

        }
    });

    socket.addEventListener("error", (e) => {
        sendDisconnected(new Error("websocket connection suddenly dropped"))
    })

    return socket
}

//type WebSocketHandler = (((ws: WebSocket) => void) | ((ws: WebSocket) => Promise<void>))

export async function connect(uri: string = wsUri, handler = setupSocket): Promise<WebSocket> {
    //if (ws) close_socket();
    if (ws) return ws;
    //if (connecting) return connecting;

    const socket = new WebSocket(uri);
    await new Promise((resolve, reject) => {

        socket.addEventListener("open", () => {
            resolve(socket);
        })

        socket.addEventListener("close", (e) => {
            reject(e);
        });

        socket.addEventListener("error", (e) => {
            reject(e);
        });

        return socket;
    });

    ws = handler(socket);
    return ws;
}

export async function disconnect(): Promise<CloseEvent> {
    //reconnect = false;
    return new Promise((res, rej) => {
        if (ws) {
            ws.addEventListener("close", (ev) => {
                console.debug("websocket sent close event")
                ws = null;
                res(ev);
            });
            ws.close();
        } else {
            throw new Error("no websocket connection")
        }

    })
}

export function send(update: string) {
    if (ws && ws.readyState == WebSocket.OPEN) {
        //console.debug("worker > server", update);
        ws.send(update);
    } else {
        // put in queue?
        throw new Error("no websocket connection")
    }
}
