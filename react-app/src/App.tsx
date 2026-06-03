import { Suspense, use, useEffect, useState } from 'react'

import { parseOverlay } from "widgets";
//import type { Overlay } from "definitions";

import TEST_OVERLAY from "../public/overlay_8x8.json"
import "./index.css"

function App() {
  const ccCallback = (channel: number, cc: number, value: number) => {
    console.log("cc", channel, cc, value);
  }
  
  const noteCallback = (channel: number, note: number, velocity: number, on: boolean) => {
    console.log("note", channel, note, velocity, on);

  }

  return (
    <>
      {parseOverlay(TEST_OVERLAY, noteCallback, ccCallback)}
    </>

  )
}

export default App;
