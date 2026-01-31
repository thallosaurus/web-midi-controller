import { process_worker_input } from "./message.ts";

// Worker got a message
onmessage = (m) => {
    const msg = JSON.parse(m.data);
    //console.log("worker got a message", msg);
    process_worker_input(msg);
}
