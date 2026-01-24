const wsUri = "ws://" + location.hostname + ":8888/ws";
let ws: WebSocket | null = null;

export function connect(uri: string) {
    if (ws) ws.close();
    
    ws = new WebSocket(uri);
    ws.onopen = () => {
        console.log("connection");
        document.querySelector<HTMLDivElement>("#connection_status")!
            .innerText = "connected";
    };
    ws.onmessage = (e) => {
        console.log(e);
    };
    ws.onclose = () => {
        document.querySelector<HTMLDivElement>("#connection_status")!
            .innerText = "disconnected";
    };
}

export function connect_local() {
    connect(wsUri);
}

export default ws;
