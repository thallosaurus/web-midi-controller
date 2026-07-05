import { OverlayView } from "@hdj/widgets";
import type { Overlay } from "@hdj/definitions";
import { useContext, useEffect, useRef, useState } from "react";
import { VOLUME_SLIDER_OVERLAY_NEW } from "./Overlays";
import { OverlaySwitcher } from "./OverlaySwitcher";
import { EventBusContext, WebsocketProvider, useWebsocketContext } from "./Contexts";
import { ConnectScreen } from "./Connect";
import { getEndpointUrl, getVersion } from "./utils";
import "./index.css"
import "@hdj/widgets/style.css"
import { AssignDialog } from "./AssignDialog";

function App() {
  /*const eventbus = useRef<EventBus>(new EventBus());
  const process = (id: string, msg: AllowedPayloads) => {
    eventbus.current.extInput(msg);
  }*/

  useEffect(() => {

    const errorHandler = ({ message, filename, lineno }: ErrorEvent) => {
      alert(`${message} ${filename}:${lineno}`)
    }
    /*const asyncErrorHandler = ({ reason }: PromiseRejectionEvent) => {
      alert(reason)
    }*/

    window.addEventListener("error", errorHandler);
    //window.addEventListener("unhandledrejection", asyncErrorHandler);
    return () => {
      window.removeEventListener("error", errorHandler);
      //window.addEventListener("unhandledrejection", asyncErrorHandler);
    }
  }, []);

  return (
    <>
      <WebsocketProvider>
        <MainView defaultOverlay={VOLUME_SLIDER_OVERLAY_NEW} />
      </WebsocketProvider>
    </>
  )
}

function MainView({ defaultOverlay }: { defaultOverlay?: Overlay }) {
  const [showOverlayPicker, setOverlayPicker] = useState(false);
  const [showDiags, setShowDiags] = useState(false);
  const [overlay, setOverlay] = useState<Overlay | null>(defaultOverlay ?? null)
  const ws = useWebsocketContext();

  const bus = useContext(EventBusContext);

  useEffect(() => {
    ws.connect(getEndpointUrl())
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
          <div onClick={() => setShowDiags(true)} style={{
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
            {overlay ? <OverlayView o={overlay} callbacks={bus} style={{
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
      <AssignDialog
        showModal={showDiags}
        closeDialog={() => setShowDiags(false)} />
    </>
  )
}

export default App;
