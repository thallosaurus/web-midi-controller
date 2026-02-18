import { UiDialog } from './ts/core/dialogs.ts'
import { setup_overlay_selector } from "./ts/common/ui_utils.ts";
import { change_overlay, clear_loaded_overlays, load_overlays_from_array, process_program_change } from "./ts/core/overlay.ts";

import { debug, setup_logger } from '@common/logger'
import { getHostFromQuery, hasFeature, resolveFeatures } from '@common/utils.ts';

import { WebsocketWorkerClient } from "./ts/websocket/client.ts"
import { EventbusWorkerClient } from "./ts/eventbus/client.ts"

export class App {
    connected: boolean = false

    static socket = new WebsocketWorkerClient();
    static eventbus = new EventbusWorkerClient();

    /**
     * start of app lifecycle
     */
    constructor(private app_elem = document.querySelector<HTMLDivElement>("#app")!) {
        setup_logger("frontend");
        const f = resolveFeatures();

        App.socket.events.addEventListener("connect", () => {
            this.app_elem.classList.remove("disconnected");

            //this.fetchOverlays(msg.overlay_path);
        })

        App.socket.events.addEventListener("disconnect", () => {
            this.app_elem.classList.add("disconnected");
            clear_loaded_overlays();
            clear_overlay_selector();
        })

        if (hasFeature(f, "default")) {
            App.socket.connectToProdEndpoint(location.hostname, 8000).then(overlayPath => {
                console.log("getting", overlayPath);
                this.fetchOverlays(overlayPath);
            });

            App.socket.events.addEventListener("data", (ev) => {
                const payload = (ev as CustomEvent).detail as any;
                switch (payload.type) {
                    case "NoteOn":
                    case "NoteOff":
                        App.eventbus.updateNote(payload.channel, payload.note, payload.velocity, true);
                        break;
                    case "ControlChange":
                        App.eventbus.updateCC(payload.channel, payload.cc, payload.value, true);
                        break;
                    case "ProgramChange":
                        change_overlay(payload.value);
                        break;
                }
            })

            App.eventbus.events.addEventListener("data", (ev) => {
                //console.log(ev.detail)
                App.socket.sendMidiData((ev as CustomEvent).detail)
            })

            UiDialog.initDialogs();
            UiDialog.initDialogTriggers();
        } else {
            alert("file frontend not implemented yet")
        }

        //this.initUi(this.handlers);
        this.initSocketConnectionTrigger();
        debug("init done", this);
    }

    setupEvents() {
        
    }
    
    async initDefaultBackend(): Promise<string> {
        return await App.socket.connectToProdEndpoint("localhost", 8000);
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

    private initSocketConnectionTrigger() {

        const connect_button = document.querySelector<HTMLDivElement>("#disconnect-fallback .container button.primary")!
        connect_button.addEventListener("pointerdown", (e) => {
            console.log("sending connect to socket message from button")
            //connectSocketMessage(this, location.hostname);
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