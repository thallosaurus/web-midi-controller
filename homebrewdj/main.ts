import { TraktorSurface, TraktorState } from "@traktor"
import { Launchpad, LaunchpadSurfaceStore } from "@launchpad";
import { MidiDriver } from "@driver-deno";

const traktorDriver = new MidiDriver({
  inputName: "test virtual input",
  outputName: "test virtual output",
  useVirtual: true
})

const launchpad = new Launchpad();
//launchpad.loadSurface(LaunchpadSurfaceStore.Session, new SmileySurface(launchpad));
launchpad.loadSurface(LaunchpadSurfaceStore.Session, new TraktorSurface(traktorDriver));
launchpad.switchToDawMode();

const deckAAux = new TraktorState(1, traktorDriver);
const deckBAux = new TraktorState(2, traktorDriver);

Deno.addSignalListener("SIGINT", () => {
  launchpad.switchToStandaloneMode();
  launchpad.close();
});