import { OverlayView } from "@hdj/widgets";
import type { Overlay } from "@hdj/definitions";
import { AllowedPayloads, asyncWebsocketClient, CCMessagePayload, NoteMessagePayload, WebsocketClient } from "@hdj/homebrewdj-web-client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { EventBus } from "./EventBus";
import { MATRIX_OVERLAY, VOLUME_SLIDER_OVERLAY, VOLUME_SLIDER_OVERLAY_NEW, XYPAD_OVERLAY } from "./Overlays";

function getEndpointUrl() {
  console.log(import.meta.env.VITE_BACKEND)
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
      <MainView defaultOverlay={VOLUME_SLIDER_OVERLAY} eventbus={eventbus.current} />
    </>
  )
}

function OverlaySwitcher({ showModal, closeOverlay, setOverlay }: { showModal: boolean, closeOverlay: () => void, setOverlay: (o: Overlay) => void }) {
  const overlays = useRef([
    VOLUME_SLIDER_OVERLAY,
    VOLUME_SLIDER_OVERLAY_NEW,
    XYPAD_OVERLAY,
    MATRIX_OVERLAY
  ])

  const dialogRef = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    if (dialogRef.current?.open && !showModal) {
      dialogRef.current.close();
    } else if (!dialogRef.current?.open && showModal) {
      dialogRef.current?.showModal();
    }
  }, [showModal]);

  const buttonStyle = {
    padding: ".7em",
    width: "100%",
    fontFamily: "monospace",
    color: "black",
    backgroundColor: "white",
    border: "none",
    fontSize: "1.2em"
  } as React.CSSProperties;

  return (
    <dialog ref={dialogRef} style={{
      fontFamily: "monospace",
      color: "white",
      border: "none",
      backgroundColor: "#131313"
    }}>
      <h2 style={{
        textAlign: "center"
      }}>Select Overlay</h2>
      <form action={(e) => {
        const selected = Number(e.get("selected"))
        const overlay = overlays.current[selected];
        setOverlay(overlay as Overlay)
        closeOverlay()
      }} style={{
        display: "flex",
        flexDirection: "column",
        width: "50vw",
        gap: ".5em"
      }}>
        {overlays.current.map((v, i) => {
          return (
            <button style={{...buttonStyle, fontWeight: "bold"}} type="submit" name="selected" value={i} key={String(v.id)}>{v.name}</button>
          )
        })}
        <button type="button" style={buttonStyle} onClick={() => closeOverlay()}>Close</button>
      </form>
    </dialog>
  )
}

function MainView({ defaultOverlay, eventbus }: { defaultOverlay?: Overlay, eventbus: EventBus }) {
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
          textAlign: "center",
          margin: "1em",
        }}><b onClick={() => setOverlayPicker(true)}>
            {overlay?.name ?? "No overlay loaded"}
          </b>
        </header>
        {overlay ? <OverlayView o={overlay} callbacks={eventbus} style={{
          width: "calc(100% - 2em)",
          height: "calc(100% - 2em)",
          padding: "1em"
        }}/> : ""}
      </div>
      <OverlaySwitcher showModal={showOverlayPicker} closeOverlay={() => setOverlayPicker(false)} setOverlay={setOverlay}></OverlaySwitcher>
    </>
  )
}

export default App;
