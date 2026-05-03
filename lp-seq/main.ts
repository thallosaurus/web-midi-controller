import { MidiDriver, MidiMessage } from "@driver";

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  let control = new MidiDriver({
    inputName: "Launchpad Pro MK3 LPProMK3 DAW",
    outputName: "Launchpad Pro MK3 LPProMK3 DAW",
    useVirtual: false
  })

  let midi = new MidiDriver({
    inputName: "Launchpad Pro MK3 LPProMK3 MIDI",
    outputName: "Launchpad Pro MK3 LPProMK3 MIDI",
    useVirtual: false
  })
  MidiDriver.initLogging();

  Deno.addSignalListener("SIGINT", () => {
    console.log("Received SIGINT");
    control.close();
    midi.close();

    setTimeout(() => Deno.exit(), 1000);
  });

  midi.emitter.addEventListener("data", (ev) => {
    //switch ((ev as CustomEvent).detail)
    const evt = ev as CustomEvent;

    switch (evt.detail.type) {
      case "TimingClock":
        //console.log("Clock");
        break;
      default:
        console.log(evt.detail)
        break;
    }
  });

  // Send Launchpad to Programmer Mode
  control.sendMidi({
    type: "SysEx",
    data: [0xF0, 0x00, 0x20, 0x29, 0x02, 0x0E, 0x0E, 0x01, 0xF7]
  });
}