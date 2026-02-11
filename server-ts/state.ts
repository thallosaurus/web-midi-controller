import { WebsocketEventHandler } from "./event_handler.ts";
import { MidiMessage } from "./messages.ts";

export class MidiState {
  bank_select: number = 0
  bank_select_fine: number = 0
  program: number = 0

  get currentConnectionId() {
    const c = new Array(WebsocketEventHandler.clients.values());

    if (this.bank_select < 0 || this.bank_select >= WebsocketEventHandler.clients.size) return null;
    return Array.from(WebsocketEventHandler.clients.keys())[this.bank_select]
  }

  mutate(msg: MidiMessage) {
    switch (msg.type) {
      case "ControlChange":
        if (msg.cc === 0) {
          this.bank_select = msg.value;
          return false
        } else if (msg.cc === 20) {
          this.bank_select_fine = msg.value;
          return false
        }
        return true
      case "ProgramChange":
        this.program = msg.value;
        return false

      default:
        return true
    }
  }
}
