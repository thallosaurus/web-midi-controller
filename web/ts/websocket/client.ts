import { type MidiMessage } from "../../../midi-driver/bindings/MidiPayload";
import { CoreWorkerClient } from "../coreworker/worker";
import { WebsocketWorkerEvent } from "./events";

export class WebsocketWorkerClient extends CoreWorkerClient<WebsocketWorkerEvent, WebsocketWorkerEvent> {
    connected = false;
    public events = new EventTarget();

    constructor() {
        super(new Worker(new URL("worker.ts", import.meta.url), { type: "module" }))
        //super(new URL("worker.ts", import.meta.url));
    }

    processWorkerClientMessage(msg: WebsocketWorkerEvent): void {
        //throw new Error("Method not implemented.");
        switch (msg.type) {
            case "data":
                this.sendMidiDataEvent(msg.payload);
            break;

            case "connection-successful":
                this.connected = true;
                this.sendConnectedEvent();
                break;

            case "connection-failed":
                this.connected = false;
                this.sendDisconnectedEvent();
                break;

            case "disconnect-successful":
                this.sendDisconnectedEvent();
                this.connected = false;
                break;
            case "disconnect-failed":
                break;
        }
    }

    private sendMidiDataEvent(data: MidiMessage) {
        this.events.dispatchEvent(new CustomEvent("data", { detail: data }));
    }

    private sendConnectedEvent() {
        this.events.dispatchEvent(new CustomEvent("connect"))
    }

    private sendDisconnectedEvent() {
        this.events.dispatchEvent(new CustomEvent("disconnect"))
    }

    sendMidiData(payload: MidiMessage) {
        this.send({
            type: "data",
            payload
        })
    }

    connectToEndpoint(host: string, port: number, path: string): Promise<string> {
        return new Promise((res, rej) => {
            const fn = (ev: MessageEvent<WebsocketWorkerEvent>) => {
                switch (ev.data.type) {
                    case "connection-successful":
                        this.worker.removeEventListener("message", fn);
                        //this.sendConnectionChangedEvent();
                        res(ev.data.overlayPath);
                        break;
                    case "connection-failed":
                        this.worker.removeEventListener("message", fn);
                        //this.sendConnectionChangedEvent();
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

    connectToProdEndpoint(host: string, port: number): Promise<string> {
        return this.connectToEndpoint(host, port, "ws");
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