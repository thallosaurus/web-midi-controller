import { MidiDriver } from "./mod.ts";

const driver = new MidiDriver({
    pollBytes: true,
    useVirtual: true,
    inputName: "midi monitor input",
    outputName: "midi monitor output"
});

driver.listDevices();


Deno.addSignalListener("SIGINT", () => {
    console.log("Received SIGINT");
    driver.close();
    
    setTimeout(() => Deno.exit(), 1000);
});

driver.emitter.addEventListener("data", (ev) => {
    const data = (ev as CustomEvent).detail;
    console.log(data);
})