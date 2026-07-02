import { Outgoing, WCallbacks } from "@hdj/widgets";

export class EventBus extends WCallbacks {
    sender: Outgoing | null = null;

    setSender(sender: Outgoing) {
        this.sender = sender;
    }
}