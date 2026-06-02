import { Launchpad, LaunchpadSurfaceStore } from "@launchpad";
import { TraktorSurface } from "@traktor";

function loadLaunchpadMapping() {

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

    return launchpad;
}

function loadSliderSurface() {
    // load http server
    // assign routes
    // add websocket listener
    
}
