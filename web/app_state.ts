import { UiDialog } from './ts/ui/dialogs.ts'
import { setup_overlay_selector } from "./ts/common/ui_utils.ts";
import { EventBusConsumerMessageType, initEventBusWorker, sendUpdateCCValue, sendUpdateExternalCCWidget, sendUpdateExternalNoteWidget, sendUpdateNoteValue } from "./ts/event_bus/client.ts";
import { SocketWorkerResponse, SocketWorkerResponseType } from "./ts/websocket/message.ts";
import { sendFrontendMidiEvent } from "./ts/websocket/client.ts";
import { CCEvent, MidiEvent, NoteEvent, ProgramChangeEvent } from "./ts/common/events.ts";
import { change_overlay, clear_loaded_overlays, load_overlays_from_array, process_program_change } from "./ts/ui/overlay.ts";
import { EventBusProducerMessage, EventBusProducerMessageType } from "./ts/event_bus/message.ts";
import { connectSocketMessage, ConnectWebsocketWorkerWithHandler, initWebsocketWorker } from "@websocket/client.ts";

import { debug, setup_logger } from '@common/logger'
import { AppEvents } from './app_events.ts'
import { getHostFromQuery, hasFeature, resolveFeatures } from '@common/utils.ts';

import { ServerResponse } from '@backend/SocketMessages.ts';
import { WebsocketEvent } from '../server-ts/messages.ts';

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
        const f = resolveFeatures();

        if (hasFeature(f, "default")) {
            this.initDefaultBackend().then((handlers) => {
                this.handlers = handlers
                console.log("were handlers set?", handlers);

                App.defaultWorkerHandler(this.handlers);
                this.initWebsocketUIChanges(this.handlers)
                let autoconnectHost = getHostFromQuery();

                if (autoconnectHost) {
                    //autoconnect
                    connectSocketMessage(handlers.socket!, autoconnectHost);
                }
            });
        } else {
            alert("file frontend not implemented yet")
        }

        this.initUi(this.handlers);
        debug("init done", this);
    }
    /*connectToServer(h: AppWorkerHandler) {
        ConnectWebsocketWorkerWithHandler(this.handlers.socket!)

        connectSocketMessage(h.socket!, wsUri);
    }*/
    async initDefaultBackend(): Promise<AppWorkerHandler> {
        let socket = initWebsocketWorker();
        let eventbus = await initEventBusWorker();

        return { eventbus, socket }
    }
    static defaultWorkerHandler(h: AppWorkerHandler) {
        h.eventbus!.addEventListener("message", (ev) => {
            const m: EventBusProducerMessage = JSON.parse(ev.data);

            // responsible for sending updates back to the server from the event bus
            switch (m.type) {
                //case EventBusProducerMessageType.RegisterNoteCallback:

                case EventBusProducerMessageType.NoteUpdate:
                    //only forward internal midi events
                    if (!m.ext) {
                        console.log("sending note update to websocket backend", m);
                        //sendFrontendMidiEvent(h.socket!, new NoteEvent(m.channel, m.note, m.velocity > 0, m.velocity));
                        if (m.velocity > 0) {

                            sendFrontendMidiEvent(h.socket!, {
                                type: "NoteOn",
                                channel: m.channel,
                                note: m.note,
                                velocity: m.velocity,
                                //on: m.velocity > 0
                            })
                        } else {
                            sendFrontendMidiEvent(h.socket!, {
                                type: "NoteOff",
                                channel: m.channel,
                                note: m.note,
                                velocity: m.velocity,
                                //on: m.velocity > 0
                            })
                        }
                    }
                    break;
                //case EventBusProducerMessageType.RegisterCCCallback:
                case EventBusProducerMessageType.CCUpdate:
                    //only forward internal midi events
                    if (!m.ext) {
                        console.log("bus update cc value on main", m);
                        //sendFrontendMidiEvent(h.socket!, new CCEvent(m.channel, m.value, m.cc));
                        sendFrontendMidiEvent(h.socket!, {
                            type: "ControlChange",
                            channel: m.channel,
                            cc: m.cc,
                            value: m.value
                        })
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
                    switch (msg.data.type) {
                        case 'JogEvent':
                            break;
                        case 'CCEvent':
                            const cc_ev = msg.data;
                            console.log("frontend cc input")
                            sendUpdateExternalCCWidget(cc_ev.channel, cc_ev.cc, cc_ev.value)
                            break;
                        case 'NoteEvent':
                            const note_ev = msg.data;
                            console.log("frontend note input")
                            sendUpdateExternalNoteWidget(note_ev.channel, note_ev.note, note_ev.velocity);
                            break;
                    }
                    break;
            }
        });

    }

    fetchOverlays(path: string) {
        fetch(path)
            .then(ol => ol.json())
            .then(ol => load_overlays_from_array(ol))
            .then((ol) => {
                setup_overlay_selector(ol);
                change_overlay(0)
            })
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

                    this.fetchOverlays(msg.overlay_path);
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
            connectSocketMessage(h.socket!, location.hostname);
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