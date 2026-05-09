import { createContext, FC, useEffect, useState } from 'react'
import './App.css'
import { useWebsocket, WebsocketWorkerClient } from './websocket/client.tsx'
import { Overlay } from '../bindings/Overlay';
import { EventbusWorkerClient, useEventBus } from './eventbus/client.tsx'
import { useOverlays } from './ui/overlay.tsx';
import { LegacyOverlay, LegacyShim } from './widgets/legacy.tsx';

const App = () => {
  const eventbus = useEventBus();
  const ws = useWebsocket();

  const [connected, setConnected] = useState(false);

  const {
    overlays,
    fetchOverlays,
    unloadOverlays,
    selectedOverlay,
    setSelectedOverlay
  } = useOverlays();

  const connectAndLoad = async () => {
    const overlayPath = await ws.connectToProdEndpoint(location.hostname, 8000)
    //setMessages(prev => [...prev, overlayPath])
    console.log("data from ws: ", overlayPath);
    const ol = await fetchOverlays(overlayPath)
    console.log("overlays", ol);
    setSelectedOverlay(0);
  }

  const disconnectAndUnload = () => {
    ws.disconnectEndpoint();
    unloadOverlays();
    //registry.unload();
  }

  useEffect(() => {
    const onConnect = () => {
      setConnected(true);
    }

    const onDisconnect = () => {
      unloadOverlays();
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

    /*window.addEventListener('error', function(event) {
    //reportError({ message: event.reason?.message, stack: event.reason?.stack });
      this.alert(event.error);
    });
    
    window.addEventListener('unhandledrejection', function (event) {
      this.alert(event.reason.message + ": " + event.reason.stack);
      //this.alert(JSON.stringify(event.reason));
    });*/


    return () => {
      ws.events.removeEventListener("connect", onConnect);
      ws.events.removeEventListener("disconnect", onDisconnect);
      ws.events.removeEventListener("data", onData);
      eventbus.events.removeEventListener("data", onEventbusData);
    }
  }, []);

  return (
    <>
      <header>
        <h1>
          {connected ? "connected" : "disconnected"}
        </h1>

        {connected ?
          <select onChange={(e) => {
            console.log(e.target.value);
            setSelectedOverlay(Number(e.target.value));
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
          : (<button onClick={() => {
            connectAndLoad()
          }}>Connect</button>)}
      </header>

      {/*<main id="overlays">
        {selectedOverlay !== null ? <OverlayView /> : <></>}
      </main>*/}

      <OverlayView />


      <footer>
        footer
      </footer>
    </>
  )
}

const OverlayView: FC = () => {
  const { selectedOverlay, overlays } = useOverlays();
  const overlay = overlays[selectedOverlay];

  useEffect(() => {
    console.log("current overlay", overlay);
  })

  return (
    overlay ?
      (<>{/*overlay.cells.map((v, i) => {
            return <>{renderWidgetReact(v)}</>
          })*/}
      <LegacyOverlay overlay={overlay} id={selectedOverlay} />
        </>)
      : (<p>error</p>)
  )
}

export default App
