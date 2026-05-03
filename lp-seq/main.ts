import { MidiDriver, MidiMessage } from "@driver";
import { Launchpad } from "./src/launchpad.ts";

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const launchpad = new Launchpad();

  Deno.addSignalListener("SIGINT", () => {
    console.log("Received SIGINT");
    launchpad.close();

    setTimeout(() => Deno.exit(), 1000);
  });

  

  // Send Launchpad to Programmer Mode
  /*control.sendMidi({
    type: "SysEx",
    data: [0xF0, 0x00, 0x20, 0x29, 0x02, 0x0E, 0x0E, 0x01, 0xF7]
  });*/

  launchpad.switchToCustomMode(2);

  setTimeout(() => {
    /*midi.sendMidi({
      type: "NoteOn",
      channel: 1,
      note: 18,
      velocity: 127
    })*/
  }, 100);
}