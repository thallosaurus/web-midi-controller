//import { init_event_bus } from "./event_bus.ts";
import "./style.css";
import "./ui/css/colors.css";

import { init_dialogs } from './ui/dialogs.ts'
import { init_debug, initWebsocketUI, setup_overlay_selector } from "./common/ui_utils.ts";
import { type EventBusConsumerMessage, EventBusConsumerMessageType, initEventBusWorker, sendUpdateCCValue, sendUpdateExternalNoteWidget, sendUpdateNoteValue } from "./event_bus/client.ts";
import { connectSocketMessage, sendFrontendMidiEvent, sendMidiEvent, WorkerMessage, WorkerMessageType } from "./websocket/message.ts";
import { ConnectSocketEvent, ConnectWebsocketWorkerWithHandler, FrontendSocketEvent, initWebsocketWorker } from "./websocket/client.ts";
import { CCEvent, MidiEvent, NoteEvent } from "./common/events.ts";
import { Overlay } from "../bindings/Overlay.ts";
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

  bus.addEventListener("message", (ev) => {
    const m: EventBusProducerMessage = JSON.parse(ev.data);

    // responsible for sending updates back to the server from the event bus
    switch (m.type) {
      case EventBusProducerMessageType.NoteUpdate:
        if (!m.ext) {
          console.log("sending note update to websocket backend", m);
          sendFrontendMidiEvent(ws, new NoteEvent(m.channel, m.note, m.velocity > 0, m.velocity));
        } else {
          console.warn("is external", m);
        }
        break;
      case EventBusProducerMessageType.CCUpdate:
        if (!m.ext) {
          console.log("bus update cc value on main", m);
          sendFrontendMidiEvent(ws, new CCEvent(m.channel, m.value, m.cc));
        }
        break;
    }
  })

  ws.addEventListener("message", (ev) => {
    const msg: WorkerMessage = JSON.parse(ev.data);

    switch (msg.type) {

      // THIS WORKS
      case WorkerMessageType.MidiFrontendInput:
        switch (msg.data.event_name) {
          case "noteupdate":
            const note_ev = msg.data as NoteEvent;
            console.log("frontend midi input")
            sendUpdateExternalNoteWidget(note_ev.midi_channel, note_ev.note, note_ev.velocity);
            //sendMidiEvent(note_ev);
            //sendUpdateNoteValue(note_ev.midi_channel, note_ev.note, note_ev.velocity, note_ev.velocity > 0, false)
            //sendFrontendMidiEvent(ws, )

            break;

        }
        break;
      case WorkerMessageType.MidiExternalInput:

        if (msg.data.event_name == "ccupdate") {
          const cc_ev = msg.data as CCEvent;
          console.log("external cc update")
          sendUpdateCCValue(cc_ev.midi_channel, cc_ev.cc, cc_ev.value);
          return
        } else if (msg.data.event_name == "noteupdate" && msg) {
          const note_ev = msg.data as NoteEvent;
          console.log("external note update")

          // got a message. we now need to send it to the eventbus so that it doesnt send it back
          //sendUpdateNoteValue(note_ev.midi_channel, note_ev.note, note_ev.velocity, note_ev.velocity > 0, true)
          return;
        }
        break;

      /*case WorkerMessageType.MidiExternalInput:
        if (msg.data.event_name == "noteupdate") {
          const note_ev = msg.data as NoteEvent;
          console.log("external note update on main", msg)
          //sendUpdateNoteValue(note_ev.midi_channel, note_ev.note, note_ev.velocity, note_ev.velocity > 0);
          sendUpdateExternalNoteWidget(note_ev.midi_channel, note_ev.note, note_ev.velocity)
          return
        }
        break;*/
    }
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