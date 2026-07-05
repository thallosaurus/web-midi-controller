import { OverlayView } from "@hdj/widgets";
import type { Overlay } from "@hdj/definitions";
import { type AllowedPayloads } from "@hdj/homebrewdj-web-client";
import { useEffect, useRef, useState } from "react";
import { VOLUME_SLIDER_OVERLAY_NEW } from "./Overlays";
import { OverlaySwitcher } from "./OverlaySwitcher";
import { EventBus, WebsocketProvider, useWebsocketContext } from "./Contexts";
import { ConnectScreen } from "./Connect";
import { getEndpointUrl, getVersion } from "./utils";

function App() {
  const eventbus = useRef<EventBus>(new EventBus());
  const process = (id: string, msg: AllowedPayloads) => {
    eventbus.current.extInput(msg);
  }

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
    ws.connect(getEndpointUrl())
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
          {ws.connectionState == "connected" ?
            <b onClick={() => setOverlayPicker(true)}>
              {overlay?.name ?? "No overlay loaded"}
            </b>
            : <div></div>}
          <div id="connection-status" onClick={() => ws.disconnect()} className={ws.connectionState}>{ws.connectionState}</div>
        </header>
        {ws.connectionState == "connected" ?
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

export default App;
