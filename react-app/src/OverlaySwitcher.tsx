import { Overlay } from "@hdj/definitions";
import { useRef, useLayoutEffect } from "react";
import { VOLUME_SLIDER_OVERLAY, VOLUME_SLIDER_OVERLAY_NEW, XYPAD_OVERLAY, MATRIX_OVERLAY, ABLETON_OVERLAY, TRAKTOR_PERFORMANCE, TestOscOverlay, MIDI_TEST_OVERLAY, ROTARIES_TEST, XYPAD_PERFORMANCE } from "./Overlays";

export function OverlaySwitcher({ showModal, closeSwitcher, setOverlay }: { showModal: boolean, closeSwitcher: () => void, setOverlay: (o: Overlay) => void }) {
  const overlays = useRef([
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
    fontSize: "1.2em",
    margin: "0.25em 0"
  } as React.CSSProperties;

  return (
    <dialog ref={dialogRef} onClose={() => closeSwitcher()} style={{
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
        closeSwitcher()
      }} style={{
        display: "flex",
        flexDirection: "column",
        width: "50vw",
        //gap: ".5em",
      }}>
        {overlays.current.map((v, i) => {
          return (<button style={{ ...buttonStyle, fontWeight: "bold" }} type="submit" name="selected" value={i} key={String(v.id)}>{v.name}</button>)
        })}
        <button type="button" style={buttonStyle} onClick={() => closeSwitcher()}>Close</button>
      </form>
    </dialog>
  )
}