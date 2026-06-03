import { parseOverlay } from "widgets";
import type { Overlay } from "definitions";
import { WebsocketClient } from "homebrewdj-web-client";
import { useEffect, useRef } from "react";

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

function App() {
  const client = useRef<WebsocketClient | null>(null);

  useEffect(() => {
    const url = new URL("/ws", location.href);
    url.protocol = "ws";
    client.current = new WebsocketClient(url);
  })

  return (
    <>
      {parseOverlay(OVERLAY, {
        sendNote: (channel: number, note: number, velocity: number, on: boolean) => {
          console.log("note", channel, note, velocity, on);
          if (client.current) client.current.send({
            type: "note",
            channel,
            note,
            velocity,
            on
          })
        }, sendCC: (channel: number, cc: number, value: number) => {
          console.log("cc", channel, cc, value);
          if (client.current) client.current.send({
            type: "cc",
            channel,
            cc,
            value
          })
        }
      })}
    </>
  )
}

export default App;
