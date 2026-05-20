import { FC, SetStateAction, useEffect, useRef, useState } from 'react'
import './App.css'
import { useWebsocket } from './websocket/client.tsx'
import { useEventBus } from './eventbus/client.tsx'
import { useOverlays } from './ui/overlay.tsx';
import { LegacyOverlay, RenderOverlayShim } from './widgets/legacy.tsx';
import { AppSidemenu, useMenuContext } from './ui/sidemenu.tsx';
import { WebsocketWorkerEvent } from './websocket/events.ts';
import { WebAudioSynthView } from './synth/synth.tsx';
import { LoadedWidget } from 'midi-controller';
import { MainView } from './ui/main_view.tsx';

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
    const messageLog = (ev: MessageEvent<WebsocketWorkerEvent>) => {
      console.log("from app", ev);
    };
    ws.events.addEventListener("message", messageLog);
    
    return () => {
      ws.events.removeEventListener("message", messageLog);
    }
  })

  useEffect(() => {
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

  return (
    <>
      <header>
        <h1 onClick={() => { if (connected) setMenuShown(!menuShown) }}>
          HomebrewDJ
        </h1>
      </header>


      {/*getMainViewContent(currentMainContent, menuShown)*/}
      <MainView />
    </>
  )
}


enum MainViewContent {
  Overlays,
  Synth,
  Connect
}




export default App
