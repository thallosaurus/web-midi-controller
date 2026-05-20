import { Fader, FaderBank, FaderOrientation, FaderType, Launchpad } from "./src/launchpad.ts";
import { DemoSurface } from "./src/surface.ts";

const fader: Fader = {
  index: 0,
  type: FaderType.Unipolar,
  controlchange: 1,
  color: 2
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const launchpad = new Launchpad();
  launchpad.switchToDawMode();
  setTimeout(() => {
    launchpad.switchInbuiltLayout(1, 0)
    launchpad.setFader(FaderBank.Volumes, FaderOrientation.Horizontal, fader)
  }, 2000);
  //launchpad.loadSurface(new DemoSurface(launchpad));

  Deno.addSignalListener("SIGINT", () => {
    launchpad.switchToStandaloneMode()
    console.log("Received SIGINT");
    launchpad.close();

    setTimeout(() => Deno.exit(), 1000);
  });

  //launchpad.switchToCustomMode(2);
  //launchpad.switchToProgrammerMode()
}