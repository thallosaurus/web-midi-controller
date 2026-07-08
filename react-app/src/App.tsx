import { OverlayView } from "@hdj/widgets";
import type { Overlay } from "@hdj/definitions";
import { useContext, useEffect, useState } from "react";
import { ABLETON_OVERLAY, MATRIX_OVERLAY, MIDI_TEST_OVERLAY, ROTARIES_TEST, TestOscOverlay, TRAKTOR_PERFORMANCE, VOLUME_SLIDER_OVERLAY, VOLUME_SLIDER_OVERLAY_NEW, XYPAD_OVERLAY, XYPAD_PERFORMANCE } from "./Overlays";
import { OverlaySwitcher } from "./OverlaySwitcher";
import { EventBusContext, WebsocketProvider, useOverlayContext, useWebsocketContext } from "./Contexts";
import { ConnectScreen } from "./Connect";
import { getEndpointUrl, getVersion } from "./utils";
import "./index.css"
import "@hdj/widgets/style.css"
import { AssignDialog } from "./AssignDialog";
import { MainLayout } from "./MainLayout";

const INBUILT_OVERLAYS = [
  VOLUME_SLIDER_OVERLAY_NEW,
  ABLETON_OVERLAY,
  VOLUME_SLIDER_OVERLAY,
  XYPAD_OVERLAY,
  MATRIX_OVERLAY,
  TestOscOverlay,
  MIDI_TEST_OVERLAY,
  TRAKTOR_PERFORMANCE,
  ROTARIES_TEST,
  XYPAD_PERFORMANCE
];

/// MARK: - Main App
function App() {
  useEffect(() => {

    const errorHandler = ({ message, filename, lineno }: ErrorEvent) => {
      alert(`${message} ${filename}:${lineno}`)
    }

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
        <MainView
          inbuiltOverlays={INBUILT_OVERLAYS}
          autoconnect={false} />
      </WebsocketProvider>
    </>
  )
}

interface MainViewProperties {
  inbuiltOverlays?: Overlay[],
  autoconnect: boolean
}

function MainView({ inbuiltOverlays, autoconnect }: MainViewProperties) {
  const [showDiags, setShowDiags] = useState(false);
  const [showOverlayPicker, setOverlayPicker] = useState(false);
  const [currentOverlay, setOverlay] = useState<Overlay | null>(null);
  const o = useOverlayContext();
  const ws = useWebsocketContext();

  useEffect(() => {
    o.setOverlay = setOverlay

    if (inbuiltOverlays) {
      o.applyOverlays(inbuiltOverlays);
    }

    if (autoconnect) ws.connect(getEndpointUrl())

    return () => {
      o.setOverlay = null;
      o.clear();
    }
  }, [])

  return <>
    <MainLayout
      header={
        <HDJHeader
          currentOverlay={currentOverlay}
          setShowDiags={setShowDiags}
          setOverlayPicker={setOverlayPicker} />
      }
      main={
        <HDJMain
          currentOverlay={currentOverlay} />
      } />

    {/* dialogs */}
    <OverlaySwitcher
      showModal={showOverlayPicker}
      closeSwitcher={() => setOverlayPicker(false)} />

    <AssignDialog
      showModal={showDiags}
      closeDialog={() => setShowDiags(false)} />
  </>
}

/// MARK: - Header
const HDJHeader = ({ currentOverlay, setShowDiags, setOverlayPicker }: {
  currentOverlay: Overlay | null,
  setShowDiags: (b: boolean) => void
  setOverlayPicker: (b: boolean) => void
}) => {
  const ws = useWebsocketContext();

  return <>
    <div onClick={() => setShowDiags(true)} style={{
      fontWeight: "bold"
    }}>HomebrewDJ v{getVersion()}</div>

    {ws.connectionState == "connected" ?
      <b onClick={() => setOverlayPicker(true)}>
        {currentOverlay?.name ?? "No overlay loaded"}
      </b>
      : <div></div>}
    <div id="connection-status" onClick={() => ws.disconnect()} className={ws.connectionState}>{ws.connectionState} {ws.clientId}</div>
  </>
}

/// MARK: - Main
const HDJMain = ({ currentOverlay }: { currentOverlay: Overlay | null }) => {
  const ws = useWebsocketContext();
  const bus = useContext(EventBusContext);

  return <>
    {ws.connectionState == "connected"
      ? (currentOverlay ?
        <OverlayView o={currentOverlay} callbacks={bus} style={{
          width: "calc(100% - 2em)",
          height: "calc(100% - 2em)",
          padding: "1em"
        }} /> : "")
      : <div style={{
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
          <ConnectScreen />

        </div>
      </div>

    }
  </>
}

export default App;
