import { Cipheriv } from "node:crypto";
import { MidiMessage } from "../../midi-driver/deno_mod.ts";
import { Launchpad } from "../src/launchpad.ts";
import { BUTTON_DEF, LightMode, Surface } from "../src/surface.ts";

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
  override onMatrixPressed(msg: MidiMessage): void {

  }

  override onMatrixReleased(msg: MidiMessage): void {

  }

  active = false;
  //interval: number;

  loadSmiley() {
    for (let i = 0; i < 64; i++) {
      const b = this.data.at(i);
      if (b) {
        const color = this.active ? 66 : b;
        this.setI(i, {
          "color": color,
          "lightMode": LightMode.Normal
        })
      } else {
        this.setI(i, null);
      }
    }
  }

  constructor(caller: Launchpad) {
    super(caller);
    /*this.loadSmiley()

    this.interval = setInterval(() => {
      this.active = !this.active;
      this.loadSmiley();
      this.drawBufferToSession();
    }, 500)*/

    this.setXY(0, 0, {
      "color": 120,
      "lightMode": LightMode.Normal
    })
    this.setMatrixCallbackXY(0, 0, ((msg) => {
      console.log("tap");
    }));
  }
}

class DemoSessionSurface extends Surface {
  override onClose(): void {

  }
  override onMatrixPressed(msg: MidiMessage): void {

  }
  override onMatrixReleased(msg: MidiMessage): void {
    //throw new Error("Method not implemented.");
  }

  constructor(caller: Launchpad) {
    super(caller)

    this.setXY(0, 0, {
      "color": 110,
      "lightMode": LightMode.Normal
    })
    this.setXY(1, 1, {
      "color": 111,
      "lightMode": LightMode.Normal
    })
    this.setXY(2, 2, {
      "color": 112,
      "lightMode": LightMode.Normal
    })
    this.setXY(3, 3, {
      "color": 113,
      "lightMode": LightMode.Normal
    })
    this.setXY(4, 4, {
      "color": 114,
      "lightMode": LightMode.Normal
    })
    this.setXY(5, 5, {
      "color": 115,
      "lightMode": LightMode.Normal
    })
    this.setXY(6, 6, {
      "color": 116,
      "lightMode": LightMode.Normal
    })
    this.setXY(7, 7, {
      "color": 117,
      "lightMode": LightMode.Normal
    })

    /*setInterval(() => {
      this.drawBuffer((msg) => {
        this.caller.sendSessionMidi(msg);
      });
    }, 100);*/


  }
}

const launchpad = new Launchpad();
launchpad.switchToDawMode();
launchpad.loadSessionSurface(new SmileySurface(launchpad));

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