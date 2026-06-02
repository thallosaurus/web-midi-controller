import { Suspense, use, useEffect, useState } from 'react'

import { parseOverlay } from "widgets";
import type { Overlay } from "widget-definitions";

import TEST_OVERLAY from "../public/overlay_ableton.json"
import "./index.css"

async function loadOverlay(): Promise<Overlay> {
  const req = await fetch("/overlay.json")
  const j = req.json();
  return j;
}

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      {parseOverlay(TEST_OVERLAY)}
    </Suspense>
  )
}

export default App;
