# midi-driver

A platform-agnostic midi driver for Deno, written in Rust and TypeScript

### Usage
For basic usage, use the following snippet:

```ts
import { MidiDriver } from "./mod.ts";

const driver = new MidiDriver({
  pollBytes: true,
  useVirtual: true,
  inputName: "midi monitor input",
  outputName: "midi monitor output",
});

driver.listDevices();

driver.emitter.addEventListener("data", (ev) => {
  const data = (ev as CustomEvent).detail;
  console.log(data);
});

Deno.addSignalListener("SIGINT", () => {
  console.log("Received SIGINT");
  driver.close();

  setTimeout(() => Deno.exit(), 1000);
});
```
