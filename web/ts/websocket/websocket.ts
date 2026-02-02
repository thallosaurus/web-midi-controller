import { MidiEvent } from "../common/events.ts";
import { sendDisconnected, sendMidiEvent } from "./message.ts";

//export const wsUri = "ws://" + location.hostname + ":8888/ws";
const PORT = 8888;

let ws: WebSocket | null = null;
//let connecting: Promise<WebSocket> | null = null;
let reconnect = true;
let backoff = 250;
const BACKOFF_MAX = 5000;

/*function scheduleReconnect() {
    setTimeout(() => {
        connect(wsUri).catch(() => { });
        backoff = Math.min(backoff * 2, BACKOFF_MAX);
    }, backoff)
}*/

function setupSocket(socket: WebSocket): WebSocket {

    // Listen for incoming websocket messages from the backend
    socket.addEventListener("message", (e) => {
        const msg: MidiEvent = JSON.parse(e.data);
        switch (msg.event_name) {
            case "noteupdate":
                console.log("external noteupdate data", msg);
                sendMidiEvent(msg);
                break
            case "ccupdate":
                console.log("external ccupdate data", msg);
                sendMidiEvent(msg);
                break;

            case "programchange":
                console.log("program change", msg);
                sendMidiEvent(msg);
                break;

        }
    });

    socket.addEventListener("error", (e) => {
        sendDisconnected(new Error("websocket connection suddenly dropped"))
    })

    return socket
}

export async function connect(host: string, handler = setupSocket): Promise<WebSocket> {
    //if (ws) close_socket();
    if (ws) return ws;
    //if (connecting) return connecting;

    const socket = new WebSocket("ws://" + host + ":" + PORT + "/ws");
    await new Promise((resolve, reject) => {

        const fn_open = (e: any) => {
            socket.removeEventListener("open", fn_open);
            resolve(socket);
        }

        const fn_close = (e: any) => {
            socket.removeEventListener("close", fn_close);
            reject(e);
        }

        const fn_error = (e: any) => {

            socket.removeEventListener("error", fn_error);
            reject(e);
        }

        socket.addEventListener("error", fn_error);
        socket.addEventListener("close", fn_close);
        socket.addEventListener("open", fn_open);

        return socket;
    });

    ws = handler(socket);
    return ws;
}

/**
 * disconnect from inside the websocket
 * @returns 
 */
export async function disconnect(): Promise<CloseEvent> {
    //reconnect = false;
    return new Promise((res, rej) => {
        if (ws) {

            const close_fn = (ev: any) => {
                console.debug("websocket sent close event")
                ws?.removeEventListener("close", close_fn);
                //ws = null;
                res(ev);
            };

            ws.addEventListener("close", close_fn);
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
