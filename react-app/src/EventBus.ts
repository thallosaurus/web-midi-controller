import { ClientNumberPayload, ClockMessagePayload } from "@hdj/homebrewdj-web-client";
import { CCDelta, NoteDelta, OscDelta, Outgoing, PgrmDelta, WCallbacks } from "@hdj/widgets";

export type ProgramChangeHandler = (n: number) => void

export class EventBus extends WCallbacks {
    sender: Outgoing | null = null;
    programChange: (ProgramChangeHandler) | null = null;

    setSender(sender: Outgoing | null) {
        this.sender = sender;
    }

    setProgramChangeHandler(handler: ProgramChangeHandler | null) {
        this.programChange = handler
    }
    override extInput(msg: (NoteDelta | CCDelta | OscDelta | PgrmDelta | ClientNumberPayload | ClockMessagePayload)): void {
        if (msg.type == "pgrm") {
            //console.log("program change message", msg);
            if (this.programChange) this.programChange(msg.value)
            return;
        }
        if (msg.type == "clientnumber") {
            console.log("disabled for now")
            return;
        }

        if (msg.type == "clock") {
            console.log(msg.data);
            return;
        }

        super.extInput(msg);
    }
}