import { process_worker_input, type WorkerMessage } from "./message.ts";
//import websocketWorkerUrl from './?worker&url';
import type { MidiEvent } from "../events.ts";

// Worker got a message
onmessage = (m) => {
    const msg: WorkerMessage = JSON.parse(m.data);
    //console.log("worker got a message", msg);
    process_worker_input(msg);
}

type WorkerEventHandler = (msg: MidiEvent) => void;
