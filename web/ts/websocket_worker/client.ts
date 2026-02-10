import { MidiMessage } from "server-ts/messages";
import { CoreWorkerClient } from "../coreworker/worker";
import { WebsocketWorkerEvent } from "./events";

export class WebsocketWorkerClient extends CoreWorkerClient<WebsocketWorkerEvent, WebsocketWorkerEvent> {
    processWorkerClientMessage(msg: WebsocketWorkerEvent): void {
        //throw new Error("Method not implemented.");
        console.log(msg);
    }
    constructor() {
        super(new URL("worker.js", import.meta.url));
    }

    sendMidiData(payload: MidiMessage) {
        this.send({
            type: "data",
            payload
        })
    }

    connectToProdEndpoint(host: string, port: number): Promise<WebsocketWorkerEvent> {
        return new Promise((res, rej) => {
            const fn = (ev: MessageEvent<WebsocketWorkerEvent>) => {
                switch (ev.data.type) {
                    case "connection-successful":
                        this.worker.removeEventListener("message", fn);
                        res(ev.data);
                        break;
                    case "connection-failed":
                        this.worker.removeEventListener("message", fn);
                        rej();
                        break;
                }
            }
            this.worker.addEventListener("message", fn);

            this.send({
                type: "connect",
                path: "ws",
                host,
                port,
            })
        })
    }

    disconnectEndpoint(): Promise<void> {
        return new Promise((res, rej) => {
            const fn = (ev: MessageEvent<WebsocketWorkerEvent>) => {
                switch (ev.data.type) {
                    case "disconnect-successful":
                        this.worker.removeEventListener("message", fn);
                        res();
                        break;
                    case "disconnect-failed":
                        this.worker.removeEventListener("message", fn);
                        rej();
                        break;
                }
            }
            this.worker.addEventListener("message", fn);

            this.send({
                type: "disconnect",
            })
        })
    }
}