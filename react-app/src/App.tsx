import { parseOverlay } from "@hdj/widgets";
import type { Overlay } from "@hdj/definitions";
import { AllowedPayloads, asyncWebsocketClient, CCMessagePayload, NoteMessagePayload, WebsocketClient } from "@hdj/homebrewdj-web-client";
import { useEffect, useRef } from "react";
import { EventBus } from "./EventBus";
import { VOLUME_SLIDER_OVERLAY, VOLUME_SLIDER_OVERLAY_NEW, XYPAD_OVERLAY } from "./Overlays";

function getEndpointUrl() {
  const url = new URL("/ws", location.href);
  url.protocol = "ws";
  return url;
}

function App() {
  const process = (msg: any) => {
    if (eventbus.current) {
      switch (msg.type) {
        case "cc":
          eventbus.current.processCC(msg);
          break
        case "note":
          eventbus.current.processNote(msg);
          break;
      }
    }
  }

  const client = useRef<WebsocketClient<AllowedPayloads> | null>(null);
  const eventbus = useRef<EventBus>(new EventBus());

  useEffect(() => {
    const url = getEndpointUrl();
    const wsClient = new WebsocketClient<CCMessagePayload | NoteMessagePayload>(url, process);
    client.current = wsClient;
    eventbus.current.setSender(wsClient);
  })

  return (
    <>
      <MainView overlay={VOLUME_SLIDER_OVERLAY} eventbus={eventbus.current} />
    </>
  )
}

function MainView({ overlay, eventbus }: { overlay: Overlay, eventbus: EventBus }) {
  return (
    <div style={{
      display: "flex",
      height: "100%",
      width: "100%",
      flexDirection: "column"
    }}>
      <header style={{
        textAlign: "center",
        margin: "1em"
      }}><b>
          {overlay.name}
        </b>
      </header>
      {parseOverlay(overlay, eventbus)}
    </div>
  )
}

export default App;
