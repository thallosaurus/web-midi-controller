import { WebsocketEventHandler } from "./event_handler.ts";
import { MidiMessage } from "./messages.ts";

export type CoreServerStateEvents = { type: "note"; payload: MidiMessage } | {
  type: "cc";
  payload: MidiMessage;
};

export class CoreServerState {
  bank_select: number = 0;
  bank_select_fine: number = 0;
  program: number = 0;

  events: EventTarget = new EventTarget();

  get currentConnectionId() {
    const c = new Array(WebsocketEventHandler.clients.values());

    if (
      this.bank_select < 0 ||
      this.bank_select >= WebsocketEventHandler.clients.size
    ) return null;
    return Array.from(WebsocketEventHandler.clients.keys())[this.bank_select];
  }

  private triggerEvent(detail: CoreServerStateEvents) {
    this.events.dispatchEvent(
      new CustomEvent("data", { detail: { ...detail, type: "midi-data" } }),
    );
  }

  inputData(msg: MidiMessage, from = null) {
    switch (msg.type) {
      case "ControlChange":
        if (msg.cc === 0) {
          this.bank_select = msg.value;
        } else if (msg.cc === 20) {
          this.bank_select_fine = msg.value;
        }
        this.triggerEvent({
          type: "cc",
          payload: msg,
        });
        break;
      case "ProgramChange":
        this.program = msg.value;
        break;

      case "NoteOff":
      case "NoteOn":
        this.triggerEvent({
          type: "note",
          payload: msg,
        });
        break;

      default:
        return true;
    }
  }
}
