import { createContext, FC, useEffect, useRef, useState } from 'react'
import './App.css'
import { useWebsocket, WebsocketWorkerClient } from './websocket/client.tsx'
import { Overlay } from '../bindings/Overlay';
import { EventbusWorkerClient, useEventBus } from './eventbus/client.tsx'
import { OverlayList, OverlaySelector, useOverlays } from './ui/overlay.tsx';
import { LegacyOverlay, LegacyShim } from './widgets/legacy.tsx';
import { Sidemenu, SidemenuChildren } from './ui/sidemenu.tsx';
import { WebsocketWorkerEvent } from './websocket/events.ts';
import { WidgetLifecycle } from 'midi-controller';

const App = () => {
  const eventbus = useEventBus();
  const { ws, connected, loadWebsocket, unloadWebsocket } = useWebsocket();

  const [showMenu, setShowMenu] = useState<boolean>(false);

  const {
    fetchOverlays,
    unloadOverlays,
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

  useEffect(() => {
    const onDisconnect = () => {
      unloadOverlays();
      setShowMenu(false);
    }
    ws.events.addEventListener("disconnect", onDisconnect);

    return () => {
      ws.events.removeEventListener("disconnect", onDisconnect);
    }
  }, []);

  useEffect(() => {
    const onData = (ev: Event) => {
      const data = (ev as CustomEvent).detail;

      switch (data.type) {
        case "NoteOn":
        case "NoteOff":
          eventbus.updateNote(data.channel, data.note, data.velocity, true);
          break;
        case "ControlChange":
          eventbus.updateCC(data.channel, data.cc, data.value, true);
          break;
        case "ProgramChange":
          //change_overlay(payload.value);
          break;

        //setMessages(prev => [...prev, data]);
      }
    }

    ws.events.addEventListener("data", onData);

    return () => {
      ws.events.removeEventListener("data", onData);
    }
  }, [])

  useEffect(() => {
    const onEventbusData = (ev: Event) => {
      const data = (ev as CustomEvent).detail;
      console.log("eventbus", data);
      ws.sendMidiData(data);
      //socket
    }

    eventbus.events.addEventListener("data", onEventbusData);

    return () => {
      eventbus.events.removeEventListener("data", onEventbusData);
    }
  }, []);

  useEffect(() => {
    loadWebsocket()
    return () => {
      unloadWebsocket();
    }
  }, [])

  return (
    <>
      <header>
        <h1 onClick={() => { if (connected) setShowMenu(!showMenu) }}>
          HomebrewDJ
        </h1>
      </header>
      {
        connected ? (
          <div id="overlays" className={showMenu ? "sidemenu-shown" : "sidemenu-hidden"}>
            <AppSidemenu showMenu={showMenu}></AppSidemenu>
            <OverlayView />
          </div>
        ) : (<ConnectView connect={connectAndLoad} />)
      }
    </>
  )
}

const AppSidemenu: FC<{ showMenu: boolean }> = ({ showMenu }) => {
  const { ws, connected } = useWebsocket();
  return (
    <div id="sidemenu" className={showMenu ? "sidemenu-shown" : "sidemenu-hidden"}>

      <Sidemenu>
        <SidemenuChildren label="Overlays">
          <OverlayList></OverlayList>
        </SidemenuChildren>
        <SidemenuChildren label="Connection">
          <p>
            <span>{connected ? "Connected" : "Disconnected"}</span>
          </p>
          <button style={{
            backgroundColor: "#333333",
            border: "none",
            color: "white",
            width: "100%",
            padding: "1em",
            fontFamily: "monospace"
          }} onClick={() => {
            ws.disconnectEndpoint();
          }}>Disconnect</button>
        </SidemenuChildren>
        <SidemenuChildren label="Debug">
          <p>
            <span>Connected</span>
          </p>
                    <button style={{
            backgroundColor: "#333333",
            border: "none",
            color: "white",
            width: "100%",
            padding: "1em",
            fontFamily: "monospace"
          }} onClick={() => {
            WidgetLifecycle.setEditMode(true)
          }}>Trigger Edit</button>
        </SidemenuChildren>
      </Sidemenu>
    </div>
  )
}

const ConnectView: FC<{ connect: () => void }> = ({ connect }) => {
  return (
    <div style={{
      height: "100%",
      width: "100%",
      display: "flex",
      justifyContent: "space-around",
    }}>
      <div style={{
        width: "50%",
        height: "auto",
        flexDirection: "column",
      }}>
        <h1>Connect to Server</h1>
        <button style={{
          height: "4em",
          width: "100%",
          fontFamily: "monospace",
          fontWeight: "bold"
        }} onClick={async () => {
          connect()
        }}>Connect</button>
      </div>
    </div>
  )
}

const OverlayView: FC = () => {
  const { selectedOverlay, overlays } = useOverlays();

  return (
    selectedOverlay != -1 ?
      (<LegacyOverlay overlay={overlays.current[selectedOverlay]} id={0} />)
      : (<p>no overlays loaded</p>)
  )
}

export default App
