function WebsocketHandler(ws: WebSocket) {
    ws.addEventListener("open", (ev) => {
        console.log(ev);
    })

    ws.addEventListener("close", (ev) => {
        console.log(ev);
    })

    ws.addEventListener("message", (ev) => {
        console.log(ev);
    })

    ws.addEventListener("error", (ev) => {
        console.log(ev);
    })
}

export class WebsocketClient {
    private ws: WebSocket
    constructor(endpoint: string) {
        const ws = new WebSocket(endpoint);
        WebsocketHandler(ws);
        this.ws = ws;
    }
}