import { Client, Server } from "node-osc";
import type { OscMessagePayload } from "./client/protocol.ts";

function parse(msg: any[]): OscMessagePayload {
  return {
    type: "osc",
    address: msg[0],
    args: msg.filter((v, i) => {
      return i != 0;
    }),
  };
}

/** Sends and receives OSC messages and exposes them through event listeners. */
export class OscDriver {
  sender: Client | null;
  receiver: Server | null;
  abort: AbortController;
  events = new EventTarget();

  /** Creates an OSC driver that sends messages to the given host and port. */
  static customHost(host: string, port: number) {
    return new OscDriver(new Client(host, port));
  }

  /** Opens the OSC sender and receiver and routes received messages to events. */
  constructor(
    sender = new Client("127.0.0.1", 8000),
    receiver = new Server(3333, "127.0.0.1"),
    abort = new AbortController(),
  ) {
    abort.signal.onabort = (ev) => {
      if (this.receiver) this.receiver.close();
      if (this.sender) sender.close();
    };

    receiver.on("message", (msg) => {
      // parse message correctly
      const detail = parse(msg);
      this.events.dispatchEvent(new CustomEvent("message", { detail }));
      this.events.dispatchEvent(new CustomEvent(detail.address, { detail }));
    });

    this.sender = sender;
    this.receiver = receiver;
    this.abort = abort;
  }

  /** Registers a callback for every OSC message received by this driver. */
  addEventListener(cb: (msg: OscMessagePayload) => void) {
    this.events.addEventListener("message", (ev) => {
      const d = (ev as CustomEvent).detail;
      cb(d);
    });
  }

  /** Registers a callback for OSC messages received at the specified address. */
  addAddressListener(address: string, cb: (msg: OscMessagePayload) => void) {
    this.events.addEventListener(address, (ev) => {
      const d = (ev as CustomEvent).detail;
      cb(d);
    });
  }

  /** Sends an OSC message through the configured sender when available. */
  async send(msg: OscMessagePayload) {
    if (this.sender) await this.sender.send(msg.address, msg.args);
  }

  /** Closes the OSC sender and receiver by aborting the driver. */
  stop() {
    this.abort.abort();
  }
}
