import { Launchpad, LaunchpadSurfaceStore } from "../../launchpad-driver/src/launchpad.ts";
import { TraktorSurface } from "../surface.ts";

const launchpad = new Launchpad();
//launchpad.loadSurface(LaunchpadSurfaceStore.Session, new SmileySurface(launchpad));
launchpad.loadSurface(LaunchpadSurfaceStore.Session, new TraktorSurface());
launchpad.switchToDawMode();

//switch to session view
launchpad.switchInbuiltLayout(0, 0);

Deno.addSignalListener("SIGINT", () => {
    launchpad.switchToStandaloneMode();
    launchpad.close();
});