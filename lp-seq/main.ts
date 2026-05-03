import { Launchpad } from "./src/launchpad.ts";
import { DrumSequencer } from "./src/sequencer/mod.ts";
import { FeedbackSurface } from "./src/surface.ts";

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const launchpad = new Launchpad();
  launchpad.loadSurface(new DrumSequencer(launchpad));

  Deno.addSignalListener("SIGINT", () => {
    launchpad.switchToLiveMode()
    console.log("Received SIGINT");
    launchpad.close();

    setTimeout(() => Deno.exit(), 1000);
  });

  //launchpad.switchToCustomMode(2);
  launchpad.switchToProgrammerMode()
}