import { MidiDriver } from "./mod.ts";

const driver = new MidiDriver({
    pollBytes: true,
    useVirtual: true
});
driver.emitter.addEventListener("data", (ev) => {
    const data = (ev as CustomEvent).detail;
    console.log(data);
})

Deno.addSignalListener("SIGINT", () => {
  console.log("Received SIGINT");
  driver.close();

  setTimeout(() => Deno.exit(), 1000);
});
