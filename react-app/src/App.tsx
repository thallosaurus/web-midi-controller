import { OverlayView } from "@hdj/widgets";
import type { Overlay } from "@hdj/definitions";
import { AllowedPayloads, WebsocketClient } from "@hdj/homebrewdj-web-client";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { VOLUME_SLIDER_OVERLAY_NEW } from "./Overlays";
import { OverlaySwitcher } from "./OverlaySwitcher";
import { EventBus, WebsocketContext, WebsocketProvider, useWebsocketContext } from "./Contexts";

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

function App() {
  const eventbus = useRef<EventBus>(new EventBus());
  const process = (id: string, msg: AllowedPayloads) => {
    eventbus.current.extInput(msg);
  }

  //const websocket = useRef(new WebsocketClient<AllowedPayloads>(process))

  return (
    <>
      <WebsocketProvider messageHandler={process}>
        <MainView defaultOverlay={VOLUME_SLIDER_OVERLAY_NEW} eventbus={eventbus.current} />
      </WebsocketProvider>
    </>
  )
}

function MainView({ defaultOverlay, eventbus }: { defaultOverlay?: Overlay, eventbus: EventBus }) {
  const [showOverlayPicker, setOverlayPicker] = useState(false);
  const [overlay, setOverlay] = useState<Overlay | null>(defaultOverlay ?? null)
  const ws = useWebsocketContext();

  useEffect(() => {
    //ws.connect(getEndpointUrl())
    eventbus.setSender(ws.ws);
    return () => {
      eventbus.setSender(null);
    }
  }, [])

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
          <div id="connection-status" onClick={() => ws.disconnect()} className={ws.connected ? "connected" : "disconnected"}>{ws.connected ? "connected" : "disconnected"}</div>
        </header>
        {ws.connected ?
          <>
            {overlay ? <OverlayView o={overlay} callbacks={eventbus} style={{
              width: "calc(100% - 2em)",
              height: "calc(100% - 2em)",
              padding: "1em"
            }} /> : ""}
          </>
          : <ConnectScreen />}
      </div>
      <OverlaySwitcher
        showModal={showOverlayPicker}
        closeSwitcher={() => setOverlayPicker(false)}
        setOverlay={setOverlay}></OverlaySwitcher>
    </>
  )
}

const buttonStyle: CSSProperties = {
  padding: "1em",
  fontFamily: "monospace",
  border: "none",
  backgroundColor: "white",
  display: "block",
  width: "100%",
  fontWeight: "bold"
}

function ConnectScreen() {
  const ws = useWebsocketContext();

  return <div style={{
    display: "flex",
    width: "100%",
    height: "100%",
    justifyContent: "space-around"
  }}>
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-around"
    }}>
      <div>
        <button style={buttonStyle} onClick={async () => {
          await ws.connect(getEndpointUrl())
          console.log("after connect")
        }}>Connect</button>
      </div>
    </div>
  </div>
}

export default App;
