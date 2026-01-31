import { process_worker_message } from "./bus";
import { EventBusConsumerMessage } from "./client";

onmessage = (e) => {
    const msg: EventBusConsumerMessage = e.data;
    process_worker_message(msg);
}