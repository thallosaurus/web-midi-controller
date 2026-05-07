import { useEffect, useState } from 'react'
import './App.css'
import { WebsocketWorkerClient } from './websocket/client'
import { Overlay } from '../bindings/Overlay';
import { EventbusWorkerClient } from './eventbus/client'

const ws = new WebsocketWorkerClient();
const eventbus = new EventbusWorkerClient();

const App = () => {
  const [connected, setConnected] = useState(false);
  //const [messages, setMessages] = useState<string[]>([]);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [selectedOverlayId, setOverlayId] = useState<number | null>(null);

  const connectAndLoad = async () => {
    const overlayPath = await ws.connectToProdEndpoint(location.hostname, 8000)
    //setMessages(prev => [...prev, overlayPath])
    console.log("data from ws: ", overlayPath);
    const ol = await fetchOverlays(overlayPath)
    setOverlays(ol);
    console.log(ol);
    setOverlayId(0);
  }

  const disconnectAndUnload = () => {
    ws.disconnectEndpoint();
    setOverlays([]);
    setOverlayId(null);
  }

  const fetchOverlays = async (path: string) => {
    const data = await fetch(path);
    const json = await data.json();
    return json;
    /*.then(ol => load_overlays_from_array(ol))
    .then((ol) => {
        setup_overlay_selector(ol);
        change_overlay(0)
    })*/
  }

  useEffect(() => {
    const onConnect = () => {
      setConnected(true);
    }

    const onDisconnect = () => {
      setConnected(false);
    }

    const onData = (ev: Event) => {
      const data = (ev as CustomEvent).detail;
      console.log(data);

      //setMessages(prev => [...prev, data]);
    }

    const onEventbusData = (ev: Event) => {
      const data = (ev as CustomEvent).detail;
      console.log("eventbus", data);
      ws.sendMidiData(data);
      //socket
    }

    ws.events.addEventListener("connect", onConnect);
    ws.events.addEventListener("disconnect", onDisconnect);
    ws.events.addEventListener("data", onData);
    eventbus.events.addEventListener("data", onEventbusData);

    return () => {
      ws.events.removeEventListener("connect", onConnect);
      ws.events.removeEventListener("disconnect", onDisconnect);
      ws.events.removeEventListener("data", onData);
      eventbus.events.removeEventListener("data", onEventbusData);
    }
  });

  return (
    <>
      <header>
        <h1>
          {connected ? "connected" : "disconnected"}
        </h1>

        {connected ?
          <select onChange={(e) => {
            setOverlayId(Number(e.target.value));
          }}>
            {overlays.map((v, i) => {
              return (
                <option key={i} value={i}>{v.name}</option>
              )
            })}
          </select>
          : (<></>)}

        {connected
          ? (<button onClick={disconnectAndUnload}>Disconnect</button>)
          : (<button onClick={connectAndLoad}>Connect</button>)}
      </header>

      <main>
        {selectedOverlayId !== null ? <OverlayView overlay={overlays[selectedOverlayId]} /> : <></>}
      </main>

      <footer>
        footer
      </footer>
    </>
  )
}

const OverlayView = ({ overlay }) => {
  return <pre>{
    JSON.stringify(overlay)
  }</pre>
}

export default App
