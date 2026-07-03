import { OverlayView } from "@hdj/widgets";
import type { Overlay } from "@hdj/definitions";
import { AllowedPayloads, CCMessagePayload, ConnectedPayload, NoteMessagePayload, OscMessagePayload, WebsocketClient } from "@hdj/homebrewdj-web-client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { EventBus } from "./EventBus";
import { VOLUME_SLIDER_OVERLAY_NEW } from "./Overlays";
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

function getVersion() {
  return import.meta.env.VITE_VERSION ?? "0.0.0";
}

export const WebsocketContext = createContext<WebsocketClient<AllowedPayloads> | null>(null);
export function useWebsocketContext() {
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const ctx = useContext(WebsocketContext);
  if (!ctx) throw new Error("no websocket loaded")
  return {
    connected: () => {
      return connectionId !== null
    },
    //connectionId,
    connect: async (uri: URL) => {
      const id = await ctx.asyncConnect(uri);
      setConnectionId(id);
    },
    disconnect: () => {
      ctx.disconnect();
      setConnectionId(null);
    },
    ws: ctx
  };
}

function App() {
  const process = (id: string, msg: AllowedPayloads) => {
    if (eventbus.current) {
      eventbus.current.extInput(msg);
    }
  }

  const eventbus = useRef<EventBus>(new EventBus());
  const websocket = useRef(new WebsocketClient<AllowedPayloads>(process))

  useEffect(() => {
    eventbus.current.setSender(websocket.current);
  }, []);

  return (
    <>
      <WebsocketContext value={websocket.current}>
        <MainView defaultOverlay={VOLUME_SLIDER_OVERLAY_NEW} eventbus={eventbus.current} />
      </WebsocketContext>
    </>
  )
}

function MainView({ defaultOverlay, eventbus }: { defaultOverlay?: Overlay, eventbus: EventBus }) {
  const [showOverlayPicker, setOverlayPicker] = useState(false);
  const [overlay, setOverlay] = useState<Overlay | null>(defaultOverlay ?? null)
  const ws = useWebsocketContext();

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
          }}>HomebrewDJ v{getVersion()}</div>
          <b onClick={() => setOverlayPicker(true)}>
            {overlay?.name ?? "No overlay loaded"}
          </b>
          <div id="connection-status" onClick={() => ws.disconnect()} className={ws.connected() ? "connected" : "disconnected"}>{ws.connected() ? "connected" : "disconnected"}</div>
        </header>
        {ws.connected() ?
          <>
            {overlay ? <OverlayView o={overlay} callbacks={eventbus} style={{
              width: "calc(100% - 2em)",
              height: "calc(100% - 2em)",
              padding: "1em"
            }} /> : ""}
          </>
          : <button onClick={() => {
            ws.connect(getEndpointUrl())
          }}>Connect</button>}
      </div>
      <OverlaySwitcher
        showModal={showOverlayPicker}
        closeSwitcher={() => setOverlayPicker(false)}
        setOverlay={setOverlay}></OverlaySwitcher>
    </>
  )
}

export default App;
