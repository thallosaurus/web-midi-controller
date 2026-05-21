import { MidiDriver } from "../deno_mod.ts";

MidiDriver.initLogging();

const driver = new MidiDriver({
    //pollBytes: true,
    useVirtual: false,
    inputName: "Launchpad Pro MK3 LPProMK3 MIDI",
    outputName: "Launchpad Pro MK3 LPProMK3 MIDI"
});

driver.ignore(["TimingClock"])

driver.listDevices();

Deno.addSignalListener("SIGINT", () => {
    driver.close();
});

driver.emitter.addEventListener("data", (ev) => {
    const data = (ev as CustomEvent).detail;
    console.log(data);
})