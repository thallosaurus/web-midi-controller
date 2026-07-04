import { useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import type { HorizontalMixerProperties, NoteButtonProperties, Overlay, VerticalMixerProperties, Widget } from "@hdj/definitions";
import { ChildLayout, Layout, WidgetCallbacks } from "@hdj/widgets";
import "./App.css";
import "@hdj/widgets/style.css"
import { TestOscOverlay, MATRIX_OVERLAY } from "./TestOverlays";
import { OverlayEditorTree } from "./Editor";

const DEFAULT_BUTTON: Widget & NoteButtonProperties = {
  "type": "notebutton",
  "output": "midi",
  "channel": 1,
  "id": null,
  "label": "test",
  "note": 60,
  "mode": "trigger"
}

const DEFAULT_VPANEL: Widget & VerticalMixerProperties = {
  id: null,
  type: "vert-mixer",
  vert: []
}

const DEFAULT_HPANEL: Widget & HorizontalMixerProperties = {
  id: null,
  type: "horiz-mixer",
  horiz: []
}

function App() {
  return (
    <OverlayEditorTree overlay={MATRIX_OVERLAY} />
  )
}

function App_() {

  const [cells, setCells] = useState<Widget[]>([

  ])
  const cbs: WidgetCallbacks = {
    sendNote(c, n, v, on) {
      console.log(c, n, v, on)
    },
    sendCC(c, cc, v) {
      console.log(c, cc, v);
    },
    sendOSC(a, args) {
      console.log(a, args);
    },
    registerNote(c, n, cb) {
      return crypto.randomUUID();
    },
    registerCC(c, n, cb) {
      return crypto.randomUUID();
    },
    registerOSC(address, cb) {
      return crypto.randomUUID();
    },

    unregisterNote(ch, n, id) {

    },

    unregisterOSC(a, id) {

    },
    unregisterCC(id) {

    },
    sendUiEvent(def) {
      console.log(def);
    }
  };

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
          justifyContent: "space-between"
        }}>
          <div style={{
            fontWeight: "bold"
          }}>Editor</div>
          <b>
            Overlay Name
          </b>
          <div>
            <button onClick={(ev) => {
              //setCells(cells)
              setCells([...cells, DEFAULT_BUTTON])
            }}>Add Button</button>

            <button onClick={(ev) => {
              //setCells(cells)
              setCells([...cells, DEFAULT_VPANEL])
            }}>Add VPanel</button>

            <button onClick={(ev) => {
              //setCells(cells)
              setCells([...cells, DEFAULT_HPANEL])
            }}>Add VPanel</button>
          </div>
        </header>
        <ChildLayout childWidgets={cells} callbacks={cbs} aux={<button className="aux" type="submit">Edit</button>} />
      </div>
    </>
  )
}

function AppOld() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>

      <div className="row">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>
    </main>
  );
}

export default App;
