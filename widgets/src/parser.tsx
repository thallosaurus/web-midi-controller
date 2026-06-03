import { Overlay, Widget } from "definitions"
import { createContext, useState } from 'react';
import { CCButton, NoteButton } from "./Button.tsx";
import { CCSlider } from "./Slider.tsx";
import { Grid, Horizontal, Vertical } from "./Layout.tsx";
import { Rotary } from "./Rotary.tsx";

const WidgetContext = createContext(null);
export function WidgetProvider({ children }) {
  /*const wsRef = useRef<WebsocketWorkerClient | null>(null);
  const [connected, setConnected] = useState(false);

  const onConnect = () => {
      setConnected(true);
  }

  const onDisconnect = () => {
      //   unloadOverlays();
      setConnected(false);
  }

  if (!wsRef.current) {
      const ws = new WebsocketWorkerClient();
      wsRef.current = ws;
  }
  
  return (
    <WsContext.Provider value={{
      ws: wsRef.current,
      connected,
      loadWebsocket: () => {
        wsRef.current.events.addEventListener("connect", onConnect);
        wsRef.current.events.addEventListener("disconnect", onDisconnect);
      },
      unloadWebsocket: () => {
        wsRef.current.events.removeEventListener("connect", onConnect);
        wsRef.current.events.removeEventListener("disconnect", onDisconnect);
      }
    }}>
    {children}
    </WsContext.Provider>
  )
  */

  const [overlay, setOverlay] = useState<Overlay | null>(null);

  return (
    <WidgetContext.Provider value={{

    }}>
      {children}
    </WidgetContext.Provider>
  )
}

export type SendNoteCallback = (channel: number, note: number, velocity: number, on: boolean) => void;
export type SendCCCallback = (channel: number, cc: number, value: number) => void;

export interface WidgetProperties<T> {
  def: T,
  callbacks: WidgetCallbacks
/*  sendNoteCallback?: SendNoteCallback
  sendCCCallback?: SendCCCallback*/
}

export interface WidgetCallbacks {
  sendNote?: SendNoteCallback
  sendCC?: SendCCCallback
}

export function Layout({ children, callbacks }: { children: Widget[], callbacks: WidgetCallbacks }) {
  return <>
    {children.map((def, k) => {
      switch (def.type) {
        case 'notebutton':
          return <NoteButton def={def} key={k} callbacks={callbacks} />
        case 'ccslider':
          return <CCSlider def={def} key={k} callbacks={callbacks} />
        case 'horiz-mixer':
          return <Horizontal def={def} key={k} callbacks={callbacks} />
        case 'vert-mixer':
          return <Vertical def={def} key={k} callbacks={callbacks} />
        case 'grid-mixer':
          return <Grid def={def} key={k} callbacks={callbacks} />
        case 'ccbutton':
          return <CCButton def={def} key={k} callbacks={callbacks} />
        case 'rotary':
          return <Rotary def={def} key={k} callbacks={callbacks} />
        case 'jogwheel':
        case 'xypad':
        case 'shift':
        case 'empty':
        default:
      }
    })}
  </>
}

function testCallback(def: any, v: number) {
  console.log(def, v);
}

export function parseOverlay<T>(o: Overlay, callbacks: WidgetCallbacks) {
  return (
    <div className="overlay" style={{
      width: "calc(100% - 1em)",
      height: "calc(100% - 1em)",
      display: "flex",
      gap: "1em",
      justifyContent: "center"
    }}>
      <Layout children={o.cells} callbacks={callbacks} />
    </div>
  )
}