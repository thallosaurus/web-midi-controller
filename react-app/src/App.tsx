import { parseOverlay } from "widgets";
import type { Overlay } from "definitions";

//import TEST_OVERLAY from "../public/overlay_traktor.json"
const OVERLAY: Overlay = {
  name: "Volume Sliders",
  channel: null,
  program: null,
  id: null,
  cells: [{
    type: "horiz-mixer",
    id: null,
    horiz: [{
      "type": "ccslider",
      "cc": 0,
      "channel": 1,
      "label": "Deck A",
      "mode": "absolute",
      "vertical": false,
      "value": 0,
      "value_off": 0,
      id: null,
      "default_value": 0
    },
    {
      "type": "ccslider",
      "cc": 0,
      "channel": 2,
      "label": "Deck B",
      "mode": "absolute",
      "vertical": false,
      "value": 0,
      "value_off": 0,
      id: null,
      "default_value": 0
    }]
  }]
};

function App() {
  const ccCallback = (channel: number, cc: number, value: number) => {
    console.log("cc", channel, cc, value);
  }

  const noteCallback = (channel: number, note: number, velocity: number, on: boolean) => {
    console.log("note", channel, note, velocity, on);

  }

  return (
    <>
      {parseOverlay(OVERLAY as any, {
        sendNote: noteCallback, sendCC: ccCallback
      })}
    </>
  )
}

export default App;
