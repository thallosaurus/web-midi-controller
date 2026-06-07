import { TraktorSurface, TraktorState } from "@hdj/traktor-driver"
import { Launchpad, LaunchpadSurfaceStore } from "@hdj/launchpad-driver";
import { MidiDriver } from "@hdj/midi-driver";

import { Server } from "./server.ts";
import { AllowedPayloads } from "./client/protocol.ts";

interface HomebrewDJConfig {
  midiInput: string;
  midiOutput: string;
  dawInput: string;
  dawOutput: string;
  traktorInput: string;
  traktorOutput: string;
}

class HomebrewDJ {
  launchpad: Launchpad
  traktor: MidiDriver

  deckAAux: TraktorState
  deckBAux: TraktorState

  server = new Server((msg: AllowedPayloads) => {
    console.log(msg);
    switch (msg.type) {
      case "cc":
        {
          const { cc, channel, value } = msg;
          if (channel == 1) {
            this.deckAAux.sendTraktorCC(cc, value);
          } else if (channel == 2) {
            this.deckBAux.sendTraktorCC(cc, value);
          }
        }
        break;
      case "note":
        {
          const { note, channel, on } = msg;
          if (channel == 1) {
            this.deckAAux.sendTraktorMidi(note, on);
          } else if (channel == 2) {
            this.deckBAux.sendTraktorMidi(note, on)
          }
        }
        break;
    }
  }, {
    hostname: "0.0.0.0"
  })
  constructor(config_path = "./config.json") {
    const file = Deno.readTextFileSync(config_path);
    const config: HomebrewDJConfig = JSON.parse(file);

    this.launchpad = new Launchpad(
      new MidiDriver({
        inputName: config.midiInput,
        outputName: config.midiOutput,
        useVirtual: false
      }),
      new MidiDriver({
        inputName: config.dawInput,
        outputName: config.dawInput,
        useVirtual: false
      })
    );

    this.traktor = new MidiDriver({
      inputName: config.traktorInput,
      outputName: config.traktorOutput,
      useVirtual: true
    });


    this.deckAAux = new TraktorState(1, this.traktor);
    this.deckBAux = new TraktorState(2, this.traktor);

    this.traktor.addEventListener((ev) => {
      const t = ev.detail;

      switch (t.type) {
        case "NoteOn":
        case "NoteOff":
          this.server.broadcast({
            type: "note",
            channel: t.channel,
            note: t.note,
            on: t.type == "NoteOn",
            velocity: t.velocity
          });

          break;
        case "ControlChange":
          this.server.broadcast({
            type: "cc",
            channel: t.channel,
            cc: t.cc,
            value: t.value
          });
          break;
      }
    })

    this.launchpad.loadSurface(LaunchpadSurfaceStore.Session, new TraktorSurface(this.traktor));
    this.launchpad.switchToDawMode();
  }

  close() {
    this.launchpad.switchToStandaloneMode();
    this.launchpad.close();
    this.traktor.close();
    this.server.close();
  }
}

const hdj = new HomebrewDJ(Deno.args[0])
Deno.addSignalListener("SIGINT", () => {
  hdj.close();
});