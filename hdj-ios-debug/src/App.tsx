//import { useState } from 'react'

import { isMidiCC, isMidiNote, OverlayView, WCallbacks, WidgetActionContext, type DeltaMessages, type MidiCCProperties, type MidiNoteProperties, type Outgoing } from '@hdj/widgets'
import './App.css'
import "@hdj/widgets/style.css"
import type { CCSliderProperties, osc, Overlay, Widget } from '@hdj/definitions'
import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    nativeOverlay?: (json: object) => void;
  }
}

const TestOscWidget: Widget & CCSliderProperties = {
  output: "midi",
  channel: 1,
  label: "midi-test",
  mode: "absolute",
  type: "ccslider",
  id: null,
  vertical: false,
  cc: 3,
  value: null,
}

const TestOscOverlay: Overlay = {
  id: "test_osc",
  name: "OSC Test Overlay",
  channel: null,
  program: null,
  style: "",
  cells: [TestOscWidget]
}

const Native = {
  invoke(action: string, payload = {}) {
    if ((window as any).webkit) {

      (window as any).webkit.messageHandlers.swift.postMessage({
        action,
        ...payload
      });
    } else {
      console.log({
        action,
        ...payload
      })
    }
  }
};

class WKOutgoing implements Outgoing {
  private wkSend(action: string, msg = {}) {
    Native.invoke(action, msg)
  }

  sendReady() {
    console.log(import.meta.env)
    if ("true" !== String(import.meta.env.DEV)) {
      this.wkSend("ready");
    } else {
      alert("dev")
      window.nativeOverlay!(TestOscOverlay);
    }
  }

  send(msg: DeltaMessages): void {
    switch (msg.type) {
      case 'note':
        this.wkSend(msg.velocity > 0 ? "noteOn" : "noteOff", {
          channel: msg.channel,
          main: msg.note,
          sub: msg.velocity
        })
        break;
      case 'cc':
        this.wkSend("cc", {
          channel: msg.channel,
          main: msg.cc,
          sub: msg.value
        })
        break;
      case 'osc':
        break;
    }
  }

}

class WKCallbacks extends WCallbacks {
  sender: WKOutgoing | null = new WKOutgoing()
}

function App() {
  //const [count, setCount] = useState(0)
  const callbacks = useRef(new WKCallbacks());
  const [overlay, setOverlay] = useState<Overlay | null>();

  useEffect(() => {
    window.nativeOverlay = (json: object) => {
      console.log("Overlay received:", json);
      setOverlay(json as Overlay)
    };

    //setTimeout(() => {
      callbacks.current.sender?.sendReady();
    //}, 10000)
  }, [])

  return (
    <>
      <h1>Debug</h1>
    </>
  )
}

export default App
