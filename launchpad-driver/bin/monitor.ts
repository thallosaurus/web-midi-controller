import { MidiMessage } from "../../midi-driver/deno_mod.ts";
import { Launchpad } from "../src/launchpad.ts";
import { DemoSurface, Surface } from "../src/surface.ts";

class DemoSessionSurface extends Surface {
  override onInput(msg: MidiMessage): void {
    console.log("demo session", msg);
  }
}

const launchpad = new Launchpad();
launchpad.switchToDawMode();
//launchpad.loadSurface(new DemoSurface(launchpad));
launchpad.loadSessionSurface(new DemoSessionSurface(launchpad));

/*const driver = new MidiDriver({
    //pollBytes: true,
    useVirtual: false,
    inputName: "Launchpad Pro MK3 LPProMK3 MIDI",
    outputName: "Launchpad Pro MK3 LPProMK3 MIDI"
});*/


Deno.addSignalListener("SIGINT", () => {
    launchpad.switchToStandaloneMode();
    launchpad.close();
});