import { useRef, useState } from 'react'
import { Grid, OverlayView, WCallbacks, WidgetActionContext, WidgetCell, type Outgoing } from '@hdj/widgets'
import { createMidiNoteButton, type Overlay, type Widget } from '@hdj/definitions'

import "./index.css"
import "@hdj/widgets/style.css"
import { EditorCell, EditorOverlayView } from './Editor'

const GridEditor = () => {
  const [gridWidth, setGridWidth] = useState(3);
  const [gridHeight, setGridHeight] = useState(3);
  const [cells, setCells] = useState<Widget[]>([
    createMidiNoteButton("test", 1, 60, "trigger"),
    createMidiNoteButton("test", 1, 61, "trigger"),
    createMidiNoteButton("test", 1, 62, "trigger"),
    createMidiNoteButton("test", 1, 63, "trigger")
  ]);

  //return <
  return <div>
    <div>over grid</div>
    <Grid def={{
      type: "grid-mixer",
      id: null,
      w: gridWidth,
      h: gridHeight,
      grid: cells
    }}>
      {cells.map((w, i) => {
        return <EditorCell w={w} />
      })}
    </Grid>
  </div>
}

function App() {
  const overlay = useRef<Overlay>({
    "name": "test",
    "channel": null,
    "id": "test_overlay",
    "program": null,
    "style": "",
    cells: [{
      id: null,
      type: "grid-mixer",
      w: 8,
      h: 8,
      grid: [
        createMidiNoteButton("test", 1, 60, "trigger")
      ]
    }]
  })

  const testWidget = useRef<Widget>({
    "type": "vert-mixer",
    "id": null,
    "vert": []
  })

  const testChildren = useRef<Widget[]>([])

  return (
    <>

        <header>
          header
        </header>
        <div style={{
          //display: "grid",
          //gridTemplateRows: "1fr",
          //gridTemplateColumns: "1fr 1fr"
          display: "flex",
          height: "100%"
        }}>
          <EditorOverlayView />
        </div>
    </>
  )
}

export default App
