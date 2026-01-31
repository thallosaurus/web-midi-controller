import { init_dialogs } from './ts/ui/dialogs.ts'
import { init_debug, initWebsocketUI, setup_overlay_selector } from "./ts/common/ui_utils.ts";
import { initEventBusWorker, sendUpdateCCValue, sendUpdateExternalCCWidget, sendUpdateExternalNoteWidget, sendUpdateNoteValue } from "./ts/event_bus/client.ts";
import { connectSocketMessage, sendFrontendMidiEvent, sendMidiEvent, WorkerMessage, WorkerMessageType } from "./ts/websocket/message.ts";
import { CCEvent, MidiEvent, NoteEvent } from "./ts/common/events.ts";
import { change_overlay, load_overlays_from_array } from "./ts/ui/overlay.ts";
import { EventBusProducerMessage, EventBusProducerMessageType } from "./ts/event_bus/message.ts";
import { ConnectSocketEvent, ConnectWebsocketWorkerWithHandler, FrontendSocketEvent, initWebsocketWorker } from "@websocket/client.ts";

import { debug, setup_logger } from '@common/logger'

//const init_ui = () => {

interface AppWorkerHandler {

    // where the websocket gets mounted on app runtime
    socket: Worker | null,

    // where the eventbus gets mounted on runtime
    eventbus: Worker | null
}

export class App {
    handlers: AppWorkerHandler = {
        socket: null,
        eventbus: null
    }

    // Event Target that fires when something happens
    emitter: EventTarget = new EventTarget();

    /**
     * start of app lifecycle
     */
    constructor() {
        setup_logger("frontend");
        this.initUi();
        Promise.all([
            initEventBusWorker(),
            initWebsocketWorker()
        ]).then(([ebus, socket]) => {
            this.handlers.eventbus = ebus;
            this.handlers.socket = socket;
            debug(ebus, socket);
            return [ebus, socket];
        }).then(App.defaultWorkerHandler)
    }
    static defaultWorkerHandler([eventbus, socket]: Worker[]) {
        eventbus.addEventListener("message", (ev) => {
            const m: EventBusProducerMessage = JSON.parse(ev.data);

            // responsible for sending updates back to the server from the event bus
            switch (m.type) {
                case EventBusProducerMessageType.NoteUpdate:
                    //only forward internal midi events
                    if (!m.ext) {
                        console.log("sending note update to websocket backend", m);
                        sendFrontendMidiEvent(socket, new NoteEvent(m.channel, m.note, m.velocity > 0, m.velocity));
                    }
                    break;
                case EventBusProducerMessageType.CCUpdate:
                    //only forward internal midi events
                    if (!m.ext) {
                        console.log("bus update cc value on main", m);
                        sendFrontendMidiEvent(socket, new CCEvent(m.channel, m.value, m.cc));
                    }
                    break;
            }
        })

        // websocket handler got a message
        socket.addEventListener("message", (ev) => {
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

    initUi() {
        init_dialogs();
    }
}

async function create_worker_threads() {
    const bus = await initEventBusWorker();
    const ws = initWebsocketWorker();
    //app_elem.classList.remove("disconnected");
}

