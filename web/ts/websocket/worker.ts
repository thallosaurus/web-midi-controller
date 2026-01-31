import { process_worker_input } from "./message.ts";
import { setup_logger } from "../common/logger"

// Worker got a message
onmessage = (m) => {
    const msg = JSON.parse(m.data);
    //console.log("worker got a message", msg);
    process_worker_input(msg);
}

setup_logger("websocket");