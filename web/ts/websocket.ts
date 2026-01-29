import { process_external } from "./event_bus.ts";

const wsUri = "ws://" + location.hostname + ":8888/ws";

let ws: WebSocket | null = null;
let connecting: Promise<WebSocket> | null = null;
let reconnect = true;
let backoff = 250;
const BACKOFF_MAX = 5000;

function scheduleReconnect() {
    setTimeout(() => {
        connect(wsUri).catch(() => {});
        backoff = Math.min(backoff * 2, BACKOFF_MAX);
    }, backoff)
}

function setupSocket(socket: WebSocket) {
    socket.onmessage = (e) => {
        process_external(e.data);
    }
    socket.onclose = () => {
        document.querySelector<HTMLDivElement>("#connection_status")!.innerText = "disconnected";
        ws = null;

        if (reconnect) scheduleReconnect();
    }
    socket.onerror = (e) => {
        console.error("ws error", e);
        socket.close();
    }
}

export async function connect(uri: string = wsUri): Promise<WebSocket> {
    //if (ws) close_socket();
    if (ws) return ws;
    if (connecting) return connecting;

    connecting = new Promise((resolve, reject) => {
        const socket = new WebSocket(uri);

        socket.onopen = () => {
            ws = socket;
            connecting = null;
            backoff = 250;

            document.querySelector<HTMLDivElement>("#connection_status")!
                .innerText = "connected";

            setupSocket(socket);

            resolve(socket);
        };

        socket.onerror = (e) => {
            connecting = null;
            reject(e);
        }
    });

    return connecting;
}

export function disconnect() {
    reconnect = false;
    if (ws) ws.close();
    ws = null;
}

export const send = (update: string) => {
    if (ws && ws.readyState == WebSocket.OPEN) {
        ws.send(update);
    } else {
        // put in queue?
        throw new Error("no websocket connection")
    }
}
