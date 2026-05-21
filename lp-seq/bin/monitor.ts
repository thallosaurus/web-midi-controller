import { Launchpad } from "../src/launchpad.ts";

const launchpad = new Launchpad();
launchpad.switchToDawMode();

/*const driver = new MidiDriver({
    //pollBytes: true,
    useVirtual: false,
    inputName: "Launchpad Pro MK3 LPProMK3 MIDI",
    outputName: "Launchpad Pro MK3 LPProMK3 MIDI"
});*/


Deno.addSignalListener("SIGINT", () => {
    launchpad.close();
});