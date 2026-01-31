//import { init_event_bus } from "./event_bus.ts";
import "./style.css";
import "./ui/colors.css";

import { init_dialogs } from './ui/dialogs.ts'
import { init_debug, initWebsocketUI, setup_overlay_selector } from "./common/ui_utils.ts";
import { initEventBusWorker, sendUpdateCCValue, sendUpdateExternalCCWidget, sendUpdateExternalNoteWidget, sendUpdateNoteValue } from "./event_bus/client.ts";
import { connectSocketMessage, sendFrontendMidiEvent, sendMidiEvent, WorkerMessage, WorkerMessageType } from "./websocket/message.ts";
import { ConnectSocketEvent, ConnectWebsocketWorkerWithHandler, FrontendSocketEvent, initWebsocketWorker } from "@websocket";
import { CCEvent, MidiEvent, NoteEvent } from "./common/events.ts";
import { change_overlay, load_overlays_from_array } from "./ui/overlay.ts";
import { EventBusProducerMessage, EventBusProducerMessageType } from "./event_bus/message.ts";

const init_ui = () => {
  console.log("init ui")
  //init_debug();
  //console.log("init event bus")
  //init_event_bus();
  console.log("init dialogs")
  init_dialogs();

  // fix on smart devices
  if (!import.meta.env.DEV) {

    window.oncontextmenu = function (e) {

      //if (e.pointerType === "touch") {

      return false;
      //}
    }
  }
};

self.addEventListener("DOMContentLoaded", () => {
  try {
    init_ui();
    console.log("finished ui init")
    /*initEventBusWorker().then(e => {
      console.log("event bus started")
    });*/

    if (import.meta.env.VITE_AUTO_CONNECT_LOCAL == "true") {

      init().then(e => {
        console.log("finished backend init")
      });
    }

  } catch (e) {
    alert(e);
  }
});

async function init() {
  //const tasks: Array<any> = []
  //let ws = await initWebsocketWorkerWithOverlaySelection();
  const app_elem = document.querySelector<HTMLDivElement>("#app")!;

  const bus = await initEventBusWorker();
  const ws = initWebsocketWorker();
  app_elem.classList.remove("disconnected");

  // connect socket and event bus together
  DefaultWorkerHandler({
    socket: ws,
    eventbus: bus
  });

  initWebsocketUI(ws);

  // connect to the websocket
  const conn_msg = await ConnectWebsocketWorkerWithHandler(ws); //.then(([worker, connectionInfo])

  fetch(conn_msg.overlay_path)
    .then(ol => ol.json())
    .then(ol => load_overlays_from_array(ol))
    .then((ol) => {
      setup_overlay_selector(ol);
      change_overlay(0)
    })
  app_elem.classList.remove("disconnected");

  //    const o = await fetch(conn_msg.overlay_path);
  //    const ol: [Overlay] = await o.json();
  //    return await load_overlays_from_array(ol);
}

interface AppWorkerHandler {
  socket: Worker,
  eventbus: Worker
}
function DefaultWorkerHandler(handlers: AppWorkerHandler) {
  handlers.eventbus.addEventListener("message", (ev) => {
    const m: EventBusProducerMessage = JSON.parse(ev.data);

    // responsible for sending updates back to the server from the event bus
    switch (m.type) {
      case EventBusProducerMessageType.NoteUpdate:
        //only forward internal midi events
        if (!m.ext) {
          console.log("sending note update to websocket backend", m);
          sendFrontendMidiEvent(handlers.socket, new NoteEvent(m.channel, m.note, m.velocity > 0, m.velocity));
        }
        break;
      case EventBusProducerMessageType.CCUpdate:
        //only forward internal midi events
        if (!m.ext) {
          console.log("bus update cc value on main", m);
          sendFrontendMidiEvent(handlers.socket, new CCEvent(m.channel, m.value, m.cc));
        }
        break;
    }
  })

  handlers.socket.addEventListener("message", (ev) => {
    const msg: WorkerMessage = JSON.parse(ev.data);

    switch (msg.type) {

      // THIS WORKS
      case WorkerMessageType.MidiFrontendInput:
        switch (msg.data.event_name) {
          case "noteupdate":
            const note_ev = msg.data as NoteEvent;
            console.log("frontend note input")
            sendUpdateExternalNoteWidget(note_ev.midi_channel, note_ev.note, note_ev.velocity);

            break;

          case "ccupdate":
            const cc_ev = msg.data as CCEvent;
            console.log("frontend cc input")
            sendUpdateExternalCCWidget(cc_ev.midi_channel, cc_ev.cc, cc_ev.value)
            break;
        }
        break;
    }
  });
}