import { Overlay, Widget } from "widget-definitions"
import { createContext } from 'react';
import { CCButton, NoteButton } from "./Button.tsx";
import { CCSlider } from "./Slider.tsx";
import { Grid, Horizontal, Vertical } from "./Layout";

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

function parseWidget(def: Widget) {
  switch (def.type) {
    case 'notebutton':
      //return <NoteButton note={def.note} id={def.id} channel={def.channel} label={def.label} mode={def.mode} />
      return <NoteButton def={def} />
    case 'ccslider':
      //return <CCSlider label={def.label} mode={def.mode} vertical={def.vertical} id={def.id} channel={def.channel} cc={def.cc} value={def.value} value_off={def.value_off} default_value={def.default_value} />
      return <CCSlider def={def} />
    case 'horiz-mixer':
      return <Horizontal def={def} />
    case 'vert-mixer':
      return <Vertical def={def} />
    case 'grid-mixer':
      return <Grid def={def} />
    case 'ccbutton':
      return <CCButton def={def} />
    case 'rotary':
    case 'jogwheel':
    case 'xypad':
    case 'shift':
    case 'empty':
    default:
  }
}

export function Layout(children: Widget[]) {
  return <>
    {children.map((v) => parseWidget(v))}
  </>
}

export function parseOverlay(o: Overlay) {
  return (
    <WidgetProvider>
      <div>
        {Layout(o.cells)}
      </div>
    </WidgetProvider>
  )
}