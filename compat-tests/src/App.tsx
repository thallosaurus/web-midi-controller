import { FC, useEffect, useState } from 'react'
import './App.css'
import { useWebsocket } from './websocket/client.tsx'
import { useEventBus } from './eventbus/client.tsx'
import { OverlayList, useOverlays } from './ui/overlay.tsx';
import { LegacyOverlay } from './widgets/legacy.tsx';
import { AppSidemenu, MenuProvider, Sidemenu, SidemenuChildren, useMenuContext } from './ui/sidemenu.tsx';
import { WidgetLifecycle } from 'midi-controller';
import { WebsocketWorkerEvent } from './websocket/events.ts';
import { WebAudioSynthView } from './synth/synth.tsx';

const App = () => {
  const eventbus = useEventBus();
  const { ws, connected, loadWebsocket, unloadWebsocket } = useWebsocket();

  //const [showMenu, setShowMenu] = useState<boolean>(false);
  const { menuShown, setMenuShown } = useMenuContext();

  const [currentMainContent, setMainContent] = useState<MainViewContent | null>(null);

  const {
    fetchOverlays,
    unloadOverlays,
    setSelectedOverlay
  } = useOverlays();

  useEffect(() => {
    //connection-successful
    ws.events.addEventListener("message", (ev: MessageEvent<WebsocketWorkerEvent>) => {
      console.log("from app", ev);
    })

    return () => {

    }
  })

  useEffect(() => {
    /*const onConnect = () => {
      setMainContent(MainViewContent.Overlays)
    }
    const onDisconnect = () => {
      unloadOverlays();
      setShowMenu(false);
    }*/
    //    ws.events.addEventListener("connect", onConnect);
    //    ws.events.addEventListener("disconnect", onDisconnect);

    if (!connected) setMainContent(MainViewContent.Connect)
  }, [connected]);

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

  const getMainViewContent = (view: MainViewContent, menuShown: boolean) => {
    //const { ws, connected, loadWebsocket, unloadWebsocket } = useWebsocket();
    /*const {
      fetchOverlays,
      setSelectedOverlay
    } = useOverlays();*/

    const connectAndLoad = async () => {
      const overlayPath = await ws.connectToProdEndpoint(location.hostname, 8000)
      //setMessages(prev => [...prev, overlayPath])
      await fetchOverlays(overlayPath)
      setMainContent(MainViewContent.Overlays);
      setSelectedOverlay(0);
    }

    switch (view) {
      case MainViewContent.Overlays:
        return (< div id="overlays" className={menuShown ? "sidemenu-shown" : "sidemenu-hidden"}>
          <AppSidemenu showMenu={menuShown}></AppSidemenu>
          <OverlayView />
        </div >)

      case MainViewContent.Synth:
        //return (<>synth</>)
        return (<WebAudioSynthView />)
      case MainViewContent.Connect:
        return (<ConnectView connect={connectAndLoad} />)
    }
  }

  return (
    <>
      <header>
        <h1 onClick={() => { if (connected) setMenuShown(!menuShown) }}>
          HomebrewDJ
        </h1>
      </header>


      {getMainViewContent(currentMainContent, menuShown)}
    </>
  )
}


enum MainViewContent {
  Overlays,
  Synth,
  Connect
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
