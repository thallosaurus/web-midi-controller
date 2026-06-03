import { TraktorSurface, TraktorState } from "@traktor"
import { Launchpad, LaunchpadSurfaceStore } from "@launchpad";
import { MidiDriver } from "@driver-deno";

import { Server } from "./server.ts";
import { AllowedPayloads } from "./client/protocol.ts";

const traktorDriver = new MidiDriver({
  inputName: "test virtual input",
  outputName: "test virtual output",
  useVirtual: true
})

const launchpad = new Launchpad();

launchpad.loadSurface(LaunchpadSurfaceStore.Session, new TraktorSurface(traktorDriver));
launchpad.switchToDawMode();

const deckAAux = new TraktorState(1, traktorDriver);
const deckBAux = new TraktorState(2, traktorDriver);

const server = new Server((msg: AllowedPayloads) => {
  console.log(msg);
  switch (msg.type) {
    case "cc":
      {
        const { cc, channel, value } = msg;
        if (channel == 1) {
          deckAAux.sendTraktorCC(cc, value);
        } else if (channel == 2) {
          deckBAux.sendTraktorCC(cc, value);
        }
      }
      break;
    case "note":
      {
        const { note, channel, on } = msg;
        if (channel == 1) {
          deckAAux.sendTraktorMidi(note, on);
        } else if (channel == 2) {
          deckBAux.sendTraktorMidi(note, on)
        }
      }
      break;
  }
}, {
  hostname: "0.0.0.0"
});

traktorDriver.addEventListener((ev) => {
  const t = ev.detail;

  switch (t.type) {
    case "NoteOn":
    case "NoteOff":
      server.broadcast({
        type: "note",
        channel: t.channel,
        note: t.note,
        on: t.type == "NoteOn",
        velocity: t.velocity
      });

      break;
    case "ControlChange":
      server.broadcast({
        type: "cc",
        channel: t.channel,
        cc: t.cc,
        value: t.value
      });
      break;
  }
})

Deno.addSignalListener("SIGINT", () => {
  launchpad.switchToStandaloneMode();
  launchpad.close();
  traktorDriver.close();
  server.close();
});