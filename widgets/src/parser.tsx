import { Overlay, Widget } from "definitions"
import { createContext, useState } from 'react';
import { CCButton, NoteButton } from "./Button.tsx";
import { CCSlider } from "./Slider.tsx";
import { Grid, Horizontal, Vertical } from "./Layout.tsx";

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

export interface WidgetProperties<T> {
  def: T
}

function parseWidget(def: Widget, k: number) {
  switch (def.type) {
    case 'notebutton':
      return <NoteButton def={def} key={k} />
    case 'ccslider':
      return <CCSlider def={def} key={k} />
    case 'horiz-mixer':
      return <Horizontal def={def} key={k} />
    case 'vert-mixer':
      return <Vertical def={def} key={k} />
    case 'grid-mixer':
      return <Grid def={def} key={k} />
    case 'ccbutton':
      return <CCButton def={def} key={k} />
    case 'rotary':
    case 'jogwheel':
    case 'xypad':
    case 'shift':
    case 'empty':
    default:
  }
}

export function Layout({ children }: { children: Widget[] }) {
  return <>
    {children.map((v, i) => parseWidget(v, i))}
  </>
}

export function parseOverlay(o: Overlay) {
  return (
    <div className="overlay" style={{
      width: "calc(100% - 1em)",
      height: "calc(100% - 1em)",
      display: "flex",
      gap: "1em",
      justifyContent: "center"
    }}>
      <Layout children={o.cells} />
    </div>
  )
}