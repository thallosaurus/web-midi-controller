import { OverlayView } from "@hdj/widgets";
import type { Overlay } from "@hdj/definitions";
import { AllowedPayloads, asyncWebsocketClient, CCMessagePayload, ConnectedPayload, NoteMessagePayload, OscMessagePayload, WebsocketClient } from "@hdj/homebrewdj-web-client";
import { createContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { EventBus } from "./EventBus";
import { VOLUME_SLIDER_OVERLAY, VOLUME_SLIDER_OVERLAY_NEW } from "./Overlays";
import { OverlaySwitcher } from "./OverlaySwitcher";

function getEndpointUrl() {
  let url;
  try {
    url = new URL(import.meta.env.VITE_BACKEND);
  } catch (e) {
    url = new URL("/ws", location.href);
    url.protocol = "ws";
  }
  
  console.log(url);
  return url;
}

function App() {
  const process = (id: string, msg: CCMessagePayload | NoteMessagePayload | ConnectedPayload | OscMessagePayload) => {
    if (eventbus.current) {
      switch (msg.type) {
        case "connection":
          setConnected(true)
        break
        case "cc":
          eventbus.current.processCC(msg);
          break
        case "note":
          eventbus.current.processNote(msg);
          break;

        case "oscmsg":
          eventbus.current.processOSC(msg);
          break;
      }
    }
  }

  const client = useRef<WebsocketClient<AllowedPayloads> | null>(null);
  const eventbus = useRef<EventBus>(new EventBus());

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const url = getEndpointUrl();
    const wsClient = new WebsocketClient<CCMessagePayload | NoteMessagePayload | ConnectedPayload>(url, process, (id) => {
      setConnected(true);
    });
    client.current = wsClient;
    eventbus.current.setSender(wsClient);
  }, []);

  return (
    <>
      <MainView connected={connected} defaultOverlay={VOLUME_SLIDER_OVERLAY_NEW} eventbus={eventbus.current} />
    </>
  )
}

function MainView({ defaultOverlay, eventbus, connected }: { defaultOverlay?: Overlay, eventbus: EventBus, connected: boolean }) {
  const [showOverlayPicker, setOverlayPicker] = useState(false);
  const [overlay, setOverlay] = useState<Overlay | null>(defaultOverlay ?? null)
  return (
    <>
      <div style={{
        display: "flex",
        height: "100%",
        width: "100%",
        flexDirection: "column"
      }}>
        <header style={{
          margin: "1em",
          display: "flex",
          justifyContent: "space-between",
        }}>
          <div style={{
            fontWeight: "bold"
          }}>HomebrewDJ</div>
          <b onClick={() => setOverlayPicker(true)}>
            {overlay?.name ?? "No overlay loaded"}
          </b>
          <div id="connection-status" className={connected?"connected":"disconnected"}>{connected?"connected":"disconnected"}</div>
        </header>
        {overlay ? <OverlayView o={overlay} callbacks={eventbus} style={{
          width: "calc(100% - 2em)",
          height: "calc(100% - 2em)",
          padding: "1em"
        }} /> : ""}
      </div>
      <OverlaySwitcher
        showModal={showOverlayPicker}
        closeSwitcher={() => setOverlayPicker(false)}
        setOverlay={setOverlay}></OverlaySwitcher>
    </>
  )
}

export default App;
