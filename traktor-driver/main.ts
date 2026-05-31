import { channel } from "node:diagnostics_channel";
import { MidiDriver } from "../midi-driver/ffi.ts";
import { Launchpad, LaunchpadSurfaceStore } from "../launchpad-driver/src/launchpad.ts";
import { LightMode, Pixel, Surface } from "../launchpad-driver/src/surface.ts";
import { MidiMessage } from "@driver-deno";
import { TraktorState } from "./state.ts";
import { TraktorSurface } from "./surface.ts";


const LoopCC = 2
const VolumeCC = 0

enum DeckActions {
    PlayPause = 1,
    Sync = 2,
    Fwd = 3,
    Bkwd = 4,
    LowKill = 5,
    MidKill = 6,
    HiKill = 7,
    MixerCue = 8,

    Loop16th = 9,
    Loop8th = 10,
    Loop4th = 11,
    Loop2nd = 12,
    Loop1 = 13,
    Loop2 = 14,
    Loop4 = 15,
    Loop8 = 16,
    Loop16 = 17,
    Loop32 = 18,
}

class DeckButton {
    action: DeckActions
    color: number

    constructor(
        action: DeckActions, color: number) {
        this.action = action;
        this.color = color;
    }
}



/**
 * Assignment for the Actions per Deck
 */
/*const MAP: DeckButton[][] = [
    [],
    [],
    [],
    [],
    [Loop4thButton, Loop2ndButton, Loop1Button, Loop2Button],
    [Loop4Button, Loop8Button, Loop16Button, Loop32Button],
    [LowKillButton, MidKillButton, HiKillButton, CueButton],
    [PlayButton, SyncButton, BkwdButton, FwdButton]
]*/




//const launchpad = new Launchpad();
//launchpad.loadSurface(LaunchpadSurfaceStore.Session, new SmileySurface(launchpad));
//launchpad.loadSurface(LaunchpadSurfaceStore.Session, new TraktorSurface());
//launchpad.switchToDawMode();

//switch to session view
//launchpad.switchInbuiltLayout(0, 0);


/*Deno.addSignalListener("SIGINT", () => {
    launchpad.switchToStandaloneMode();
    launchpad.close();
});*/

export {
    TraktorState
}