import { Cipheriv } from "node:crypto";
import { MidiMessage } from "../../midi-driver/deno_mod.ts";
import { Launchpad, LaunchpadSurfaceStore } from "../src/launchpad.ts";
import { LaunchpadProMap, LightMode, Surface } from "../src/surface.ts";
import { BUTTON_DEF } from "../src/controls.ts";

class SmileySurface extends Surface {



  static getData(col: number) {
    return [
      0, 0, 0, 0, 0, 0, 0, 0,
      0, col, col, 0, 0, col, col, 0,
      0, col, col, 0, 0, col, col, 0,
      0, 0, 0, 0, 0, 0, 0, 0,
      0, col, 0, 0, 0, 0, col, 0,
      0, col, col, 0, 0, col, col, 0,
      0, 0, col, col, col, col, 0, 0,
    ]
  }
  override onClose(): void {
    //clearInterval(this.interval)
  }

  active = false;

  data = [
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 120, 120, 0, 0, 120, 120, 0,
    0, 120, 120, 0, 0, 120, 120, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 120, 0, 0, 0, 0, 120, 0,
    0, 120, 120, 0, 0, 120, 120, 0,
    0, 0, 120, 120, 120, 120, 0, 0,
  ]

  //interval: number;

  currentColor = 66;

  loadSmiley() {
    this.loadMatrixPattern(SmileySurface.getData(this.active ? 120 : 66));

    this.setControlMapping(BUTTON_DEF.Shift, (p, cc) => {
      console.log("shift", p ? "pressed" : "released");
      this.currentColor = p ? 69 : 66;
      this.loadMatrixPattern(SmileySurface.getData(this.currentColor));

    })
    
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const i = (y * 8) + x;
        if (this.data[i] > 0) {
          //console.log(this.data[i], x, y)
          this.setMatrixMappingXY(x, y, (p, n, v) => {
            //console.log(p, n, v);
            this.currentColor = p ? 120 : 66;

            this.loadMatrixPattern(SmileySurface.getData(this.currentColor));
          })
        }
      }
    }
  }

  constructor() {
    super();
    this.loadSmiley()

    /*this.events.addEventListener("matrix", (ev) => {
      const evt = ev as CustomEvent;

      console.log("matrix event", evt.detail);
      //this.caller.drawToLaunchpad(LaunchpadSurfaceStore.Session);
    })
    this.events.addEventListener("controls", (ev) => {
      const evt = ev as CustomEvent;

      console.log("controls event", evt.detail);
    })*/
  }
}


class TestSurface extends Surface {
  override onClose(): void {
    //throw new Error("Method not implemented.");
  }

  constructor() {
    super();
    /*this.setMatrixColorXY(0, 7, {
      "color": 120,
      "lightMode": LightMode.Normal
    })*/

    this.setMatrixMappingXY(0, 7, (pressed, n, v) => {
      this.setMatrixColorXY(0, 7, {
        color: v,
        lightMode: LightMode.Normal
      })
      //caller.drawToLaunchpad(LaunchpadSurfaceStore.Session)
      /*if (pressed) {
        console.log(pressed, n, v);
    }*/
    })

    this.setControlMapping(BUTTON_DEF.Volume, (pressed, cc) => {
      console.log(pressed, cc);
    })

    /*     this.events.addEventListener("matrix", (ev) => {
          const evt = ev as CustomEvent;
          console.log(evt.detail);
        }) */

    /*this.events.addEventListener("controls", (ev) => {
      const evt = ev as CustomEvent;


    })*/
  }
}


const launchpad = new Launchpad();
//launchpad.loadSurface(LaunchpadSurfaceStore.Session, new SmileySurface(launchpad));
launchpad.loadSurface(LaunchpadSurfaceStore.Session, new SmileySurface());
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