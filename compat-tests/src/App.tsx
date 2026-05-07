import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { WebsocketWorkerClient } from './websocket/client'

const ws = new WebsocketWorkerClient();

function App() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [overlays, setOverlays] = useState<any[]>([]);

  const connectAndLoad = async () => {
    const overlayPath = await ws.connectToProdEndpoint(location.hostname, 8000)
    console.log("data from ws: ", overlayPath);
    const ol = await fetchOverlays(overlayPath)
    setOverlays(ol);
    console.log(ol);
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

      setMessages(prev => [...prev, data]);
    }

    ws.events.addEventListener("connect", onConnect);
    ws.events.addEventListener("disconnect", onDisconnect);
    ws.events.addEventListener("data", onData);

    //ws.connectToProdEndpoint("localhost", 8000);

    return () => {
      ws.events.removeEventListener("connect", onConnect);
      ws.events.removeEventListener("disconnect", onDisconnect);
      ws.events.removeEventListener("data", onData);

      //ws.disconnectEndpoint();
    }
  });

  return (
    <div>
      <h1>
        {connected ? "connected" : "disconnected"}
      </h1>

      {connected 
        ? (<button onClick={(ev) => {ws.disconnectEndpoint()}}>Disconnect</button>)
        : (<button onClick={connectAndLoad}>Connect</button>)}

      {messages.map((msg, i) => (
        <pre key={i}>
          {JSON.stringify(msg)}
        </pre>
      ))}
    </div>
  )
}

function AppOld() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
