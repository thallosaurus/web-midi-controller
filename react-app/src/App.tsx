import { Suspense, use, useEffect, useState } from 'react'

import { parseOverlay } from "widgets";
//import type { Overlay } from "definitions";

import TEST_OVERLAY from "../public/overlay.json"
import "./index.css"

function App() {
  const callback = (t: any, v: number) => {
    console.log(t, v);
  }

  return (
    <>
      {parseOverlay(TEST_OVERLAY, callback)}
    </>

  )
}

export default App;
