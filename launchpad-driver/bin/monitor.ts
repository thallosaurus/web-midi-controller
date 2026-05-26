import { Cipheriv } from "node:crypto";
import { MidiMessage } from "../../midi-driver/deno_mod.ts";
import { Launchpad, LaunchpadSurfaceStore } from "../src/launchpad.ts";
import { LightMode, Surface } from "../src/surface.ts";

class SmileySurface extends Surface {
  override onClose(): void {
    //clearInterval(this.interval)
  }
  data = [
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 120, 120, 0, 0, 120, 120, 0,
    0, 120, 120, 0, 0, 120, 120, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 120, 0, 0, 0, 0, 120, 0,
    0, 120, 120, 0, 0, 120, 120, 0,
    0, 0, 120, 120, 120, 120, 0, 0,
  ]

  active = false;
  //interval: number;

  loadSmiley() {
    for (let i = 0; i < 64; i++) {
      const b = this.data.at(i);
      if (b) {
        const color = this.active ? 66 : b;
        this.matrixManager.setIColor(i, {
          "color": color,
          "lightMode": LightMode.Normal
        })
      } else {
        this.matrixManager.setIColor(i, null);
      }
    }
  }

  constructor(caller: Launchpad) {
    super(caller);
    this.loadSmiley()

    this.events.addEventListener("matrix", (ev) => {
      const evt = ev as CustomEvent;

      console.log("matrix event", evt.detail);
      this.caller.drawToLaunchpad(LaunchpadSurfaceStore.Session);
    })
    this.events.addEventListener("controls", (ev) => {
      const evt = ev as CustomEvent;

      console.log("controls event", evt.detail);
    })
    /*

    this.interval = setInterval(() => {
      this.active = !this.active;
      this.loadSmiley();
      this.drawBufferToSession();
    }, 500)*/

    /*this.setXYColor(0, 0, {
      "color": 120,
      "lightMode": LightMode.Normal
    })*/
    /*this.setMatrixCallbackXY(0, 0, ((msg) => {
      console.log("tap");
    }));*/

    /*this.controlpixelsActions.set(BUTTON_DEF.RecArm, (msg) => {
      console.log("test", msg);
    })*/
  }
}

const launchpad = new Launchpad();
launchpad.loadSurface(LaunchpadSurfaceStore.Session, new SmileySurface(launchpad));
launchpad.switchToDawMode();

//switch to session view
launchpad.switchInbuiltLayout(0, 0);

/*const driver = new MidiDriver({
    //pollBytes: true,
    useVirtual: false,
    inputName: "Launchpad Pro MK3 LPProMK3 MIDI",
    outputName: "Launchpad Pro MK3 LPProMK3 MIDI"
});*/


Deno.addSignalListener("SIGINT", () => {
  launchpad.switchToStandaloneMode();
  launchpad.close();
});