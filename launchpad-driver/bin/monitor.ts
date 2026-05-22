import { MidiMessage } from "../../midi-driver/deno_mod.ts";
import { Launchpad } from "../src/launchpad.ts";
import { BUTTON_DEF, LightMode, Surface } from "../src/surface.ts";

class DemoSessionSurface extends Surface {
  override onDraw(): void {
    throw new Error("Method not implemented.");
  }

  constructor(caller: Launchpad) {
    super(caller)

    this.setXY(0, 0, {
      "color": 110,
      "lightMode": LightMode.Normal
    })
    this.setXY(1, 0, {
      "color": 111,
      "lightMode": LightMode.Normal
    })
    this.setXY(2, 0, {
      "color": 112,
      "lightMode": LightMode.Normal
    })
    this.setXY(3, 0, {
      "color": 113,
      "lightMode": LightMode.Normal
    })
    this.setXY(4, 0, {
      "color": 114,
      "lightMode": LightMode.Normal
    })
    this.setXY(5, 0, {
      "color": 115,
      "lightMode": LightMode.Normal
    })
    this.setXY(6, 0, {
      "color": 116,
      "lightMode": LightMode.Normal
    })
    this.setXY(7, 0, {
      "color": 117,
      "lightMode": LightMode.Normal
    })

    /*setInterval(() => {
      this.drawBuffer((msg) => {
        this.caller.sendSessionMidi(msg);
      });
    }, 100);*/


  }

  override onMatrixInput(msg: MidiMessage): void {
    console.log("demo session", msg);

    switch (msg.type) {
      case "NoteOn":
        /*this.setXY(1, 0, {
          "color": 119,
          "lightMode": LightMode.Normal
        })*/

        /*this.setControlButton(BUTTON_DEF.Volume, {
          "color": 119,
          "lightMode": LightMode.Normal
        })*/
        break;

      case "NoteOff":
        //this.setXY(1, 0, null);
        //this.setControlButton(BUTTON_DEF.Volume, null)
        break;
    }

    this.drawBuffer((msg) => {
      this.caller.sendSessionMidi(msg);
    });
  }
}

const launchpad = new Launchpad();
launchpad.switchToDawMode();
launchpad.loadSessionSurface(new DemoSessionSurface(launchpad));
//launchpad.loadSessionSurface(new DemoSessionSurface(launchpad));

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