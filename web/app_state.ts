import { UiDialog } from './ts/ui/dialogs.ts'
import { setup_overlay_selector } from "./ts/common/ui_utils.ts";
import { initEventBusWorker, sendUpdateCCValue, sendUpdateExternalCCWidget, sendUpdateExternalNoteWidget, sendUpdateNoteValue } from "./ts/event_bus/client.ts";
import { SocketWorkerResponse, SocketWorkerResponseType } from "./ts/websocket/message.ts";
import { sendFrontendMidiEvent } from "./ts/websocket/client.ts";
import { CCEvent, MidiEvent, NoteEvent } from "./ts/common/events.ts";
import { change_overlay, clear_loaded_overlays, load_overlays_from_array } from "./ts/ui/overlay.ts";
import { EventBusProducerMessage, EventBusProducerMessageType } from "./ts/event_bus/message.ts";
import { connectSocketMessage, ConnectWebsocketWorkerWithHandler, initWebsocketWorker } from "@websocket/client.ts";

import { debug, setup_logger } from '@common/logger'
import { AppEvents } from './app_events.ts'
import { wsUri } from '@websocket/websocket.ts';

//const init_ui = () => {

export interface AppWorkerHandler {

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
    //emitter: AppEvents = new AppEvents();

    connected: boolean = false

    /**
     * start of app lifecycle
     */
    constructor(private app_elem = document.querySelector<HTMLDivElement>("#app")!) {
        setup_logger("frontend");
        this.initBackend().then((handlers) => {
            this.handlers = handlers
            console.log("were handlers set?", handlers);

            App.defaultWorkerHandler(this.handlers);
            this.initUi(this.handlers);
            this.initWebsocketUIChanges(this.handlers)
            debug("init done", this);

            if (import.meta.env.VITE_AUTO_CONNECT_LOCAL == "true") {
                connectSocketMessage(this.handlers.socket!, wsUri);
            }
        });
    }
    /*connectToServer(h: AppWorkerHandler) {
        ConnectWebsocketWorkerWithHandler(this.handlers.socket!)

        connectSocketMessage(h.socket!, wsUri);
    }*/
    async initBackend(): Promise<AppWorkerHandler> {
        let socket = initWebsocketWorker();
        let eventbus = await initEventBusWorker();

        return { eventbus, socket }
    }
    static defaultWorkerHandler(h: AppWorkerHandler) {
        h.eventbus!.addEventListener("message", (ev) => {
            const m: EventBusProducerMessage = JSON.parse(ev.data);

            // responsible for sending updates back to the server from the event bus
            switch (m.type) {
                case EventBusProducerMessageType.NoteUpdate:
                    //only forward internal midi events
                    if (!m.ext) {
                        console.log("sending note update to websocket backend", m);
                        sendFrontendMidiEvent(h.socket!, new NoteEvent(m.channel, m.note, m.velocity > 0, m.velocity));
                    }
                    break;
                case EventBusProducerMessageType.CCUpdate:
                    //only forward internal midi events
                    if (!m.ext) {
                        console.log("bus update cc value on main", m);
                        sendFrontendMidiEvent(h.socket!, new CCEvent(m.channel, m.value, m.cc));
                    }
                    break;
            }
        })

        // websocket handler got a message
        h.socket!.addEventListener("message", (ev) => {
            const msg: SocketWorkerResponseType = JSON.parse(ev.data);

            switch (msg.type) {

                // THIS WORKS
                case SocketWorkerResponse.MidiFrontendInput:
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

    private initWebsocketUIChanges(h: AppWorkerHandler) {
        const fn = (ev: MessageEvent<any>) => {
            const msg: SocketWorkerResponseType = JSON.parse(ev.data);
            switch (msg.type) {
                case SocketWorkerResponse.Disconnected:
                    this.app_elem.classList.add("disconnected");
                    clear_loaded_overlays();
                    clear_overlay_selector();
                    break;

                case SocketWorkerResponse.Connected:
                    this.app_elem.classList.remove("disconnected");

                    fetch(msg.overlay_path)
                        .then(ol => ol.json())
                        .then(ol => load_overlays_from_array(ol))
                        .then((ol) => {
                            setup_overlay_selector(ol);
                            change_overlay(0)
                        })
                    break;
            }
        }
        h.socket!.addEventListener("message", fn);

        this.initSocketConnectionTrigger(h)
    }

    initUi(_: AppWorkerHandler) {
        //init_dialogs();
        UiDialog.initDialogs();
        UiDialog.initDialogTriggers();
    }

    private initSocketConnectionTrigger(h: AppWorkerHandler) {

        const connect_button = document.querySelector<HTMLDivElement>("#disconnect-fallback .container button.primary")!
        connect_button.addEventListener("click", (e) => {
            console.log("sending connect to socket message from button")
            connectSocketMessage(h.socket!, wsUri);
        });
    }
}

const clear_overlay_selector = () => {
    const overlay_selector = document.querySelector<HTMLUListElement>(
        "ul#overlay_selector",
    )!;

    const childs = overlay_selector.querySelectorAll<HTMLLIElement>("[data-role='overlay_switch']");

    console.log(overlay_selector);

    childs.forEach(e => {
        overlay_selector.removeChild(e);
    })
}