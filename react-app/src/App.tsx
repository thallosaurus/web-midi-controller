import { parseOverlay, type WidgetCallbacks } from "widgets";
//import type { Overlay } from "definitions";

import TEST_OVERLAY from "../public/overlay_8x8.json"
import "./index.css"
import {  useRef } from "react";

function App() {
  const ccCallback = (channel: number, cc: number, value: number) => {
    console.log("cc", channel, cc, value);
  }

  const noteCallback = (channel: number, note: number, velocity: number, on: boolean) => {
    console.log("note", channel, note, velocity, on);

  }

  const callbacks = useRef<WidgetCallbacks>({
    sendNote: noteCallback, sendCC: ccCallback
  })

  return (
    <>
      {parseOverlay(TEST_OVERLAY as any, callbacks.current)}
    </>
  )
}

export default App;
