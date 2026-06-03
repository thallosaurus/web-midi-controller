import { parseOverlay } from "widgets";
import type { Overlay } from "definitions";
import { WebsocketClient } from "homebrewdj-web-client";
import { useEffect, useRef } from "react";

//import { WebsocketClient } from "homebrewdj-web-client/client";

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
      "id": null,
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
      "id": null,
      "default_value": 0
    }]
  }]
};

function OverlayView() {
  return (
    <>
      {parseOverlay(OVERLAY as any, {
        sendNote: noteCallback, sendCC: ccCallback
      })}
    </>
  )
}

function App() {
  const client = useRef<WebsocketClient | null>(null);

  useEffect(() => {
    client.current = new WebsocketClient("http://localhost:8080/ws");
  })

  const ccCallback = (channel: number, cc: number, value: number) => {
    console.log("cc", channel, cc, value);
    if (client.current) client.current.send({
      type: "cc",
      channel,
      cc,
      value
    })
  }

  const noteCallback = (channel: number, note: number, velocity: number, on: boolean) => {
    console.log("note", channel, note, velocity, on);
    if (client.current) client.current.send({
      type: "note",
      channel,
      note,
      velocity,
      on
    })
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
