import { process_external } from "./events.ts";

const wsUri = "ws://" + location.hostname + ":8888/ws";
let ws: WebSocket | null = null;

const connect = (uri: string) => {
    if (ws) close_socket();

    ws = new WebSocket(uri);
    ws.onopen = () => {
        console.log("connection");
        document.querySelector<HTMLDivElement>("#connection_status")!
            .innerText = "connected";
    };
    ws.onmessage = (e) => {
        console.log(e);
        process_external(e.data)
    };
    ws.onclose = () => {
        document.querySelector<HTMLDivElement>("#connection_status")!
            .innerText = "disconnected";
            ws = null
    };
}

const close_socket = () => {
    if (ws) {
        ws.close();
    }

    ws = null;
}

export const connect_local = () => {
    connect(wsUri);
}

export const send = (update: string) => {
    if (!ws) {
        throw new Error("no websocket connection")
    }
    ws.send(update);
}

export default ws;
