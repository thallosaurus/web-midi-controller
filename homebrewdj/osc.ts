import { Client, Server } from "node-osc";
import type { OscMessagePayload } from "./client/protocol.ts";

function parse(msg: any[]): OscMessagePayload {
    return {
        type: "oscmsg",
        address: msg[0],
        args: msg.filter((v, i) => {
            return i != 0
        })
    }
}

export class OscDriver {
    sender: Client
    receiver: Server
    abort: AbortController
    events = new EventTarget();

    static customHost(host: string, port: number) {
        return new OscDriver(new Client(host, port))
    }

    constructor(
        sender = new Client("127.0.0.1", 8000),
        receiver = new Server(3333, "0.0.0.0"),
        abort = new AbortController()
    ) {
        abort.signal.onabort = (ev) => {
            receiver.close();
            sender.close();
        }

        receiver.on("message", (msg) => {
            // parse message correctly
            const detail = parse(msg);
            this.events.dispatchEvent(new CustomEvent("message", { detail }))
            this.events.dispatchEvent(new CustomEvent(detail.address, { detail }))
        })

        
        this.sender = sender;
        this.receiver = receiver;
        this.abort = abort
    }

    addEventListener(cb: (msg: OscMessagePayload) => void) {
        this.events.addEventListener("message", (ev) => {
            const d = (ev as CustomEvent).detail;
            cb(d);
        });
    }
    
    addAddressListener(address: string, cb: (msg: OscMessagePayload) => void) {
        this.events.addEventListener(address, (ev) => {
            const d = (ev as CustomEvent).detail;
            cb(d);
        })
    }

    async send(msg: OscMessagePayload) {
        await this.sender.send(msg.address, ...msg.args)
    }

    stop() {
        this.abort.abort();
    }
}