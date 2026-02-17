import { MidiDriver } from "./mod.ts";

const driver = new MidiDriver({
    pollBytes: true
});
driver.emitter.addEventListener("data", (ev) => {
    const data = (ev as CustomEvent).detail;
    console.log(data);
})