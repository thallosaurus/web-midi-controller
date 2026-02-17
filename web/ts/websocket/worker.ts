import { WebsocketServerMessage } from "../../../server/messages";
import { CoreWorker } from "../coreworker/worker";
import { WebsocketWorkerEvent } from "./events";

class WebsocketWorker extends CoreWorker<WebsocketWorkerEvent, WebsocketWorkerEvent> {
    socket: WebSocket | null = null
    clientId: string | null = null
    constructor() {
        super();
    }

    socketMessageHandler(e: WebSocket) {
        e.addEventListener("message", (e) => {
            const data: WebsocketServerMessage = JSON.parse(e.data);
            switch (data.type) {
                case "connection-information":
                    this.clientId = data.connectionId;
                    this.send({
                        type: "connection-successful",
                        overlayPath: data.overlayPath
                    })
                    break;
                case "midi-data":
                    console.log("got midi event", data);
                    this.send({
                        type: "data",
                        payload: (data as any).data
                    })
                    break;
            }
        })
    }

    processWorkerInputMessage(e: WebsocketWorkerEvent): void {
        switch (e.type) {
            case "data":
                if (this.socket) {
                    this.socket.send(JSON.stringify(e.payload));
                }
                break;
            case "connect":
                // process connect

                const uri = "ws://" + e.host + ":" + e.port + "/" + (e.path ?? "ws");
                const socket = new WebSocket(uri);

                // connect to the server
                connectSocketAsync(socket).then(() => {

                    // and register the socket message handler which handles the connection information passage to the front
                    this.socketMessageHandler(socket);
                    this.socket = socket;

                }).catch(e => {
                    console.error("connection failed:", e);
                    //this.socket = null
                    this.send({
                        type: "connection-failed"
                    })
                })
                break;

            case "disconnect":
                //process disconnect
                // cleanup socket
                if (this.socket) {

                    this.socket.close();
                    this.send({
                        type: "disconnect-successful"
                    })
                } else {
                    this.send({
                        type: "disconnect-failed"
                    })
                }
                break;
        }
    }
}

function connectSocketAsync(socket: WebSocket): Promise<void> {
    return new Promise((resolve, reject) => {
        const fn_open = (e: any) => {

            //console.log("connected", uri);
            socket.removeEventListener("open", fn_open);
            resolve();
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
    });
}

new WebsocketWorker();