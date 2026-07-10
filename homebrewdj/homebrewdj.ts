import { TraktorSurface, TraktorState } from "@hdj/traktor-driver"
import { Launchpad, LaunchpadSurfaceStore } from "@hdj/launchpad-driver";
import { MidiDriver } from "@hdj/midi-driver/ffi";

import { forwardMidiToServer, forwardWebsocketMessageToPorts, Server } from "./server.ts";
import type { AllowedPayloads, OscMessagePayload } from "./client/protocol.ts";
import { OscDriver } from "./osc.ts";
//import { MidiMessage } from "../midi-driver/index.ts";
//import type { MidiMessage } from "@hdj/midi-driver";

/**
 * Configuration describing the MIDI endpoints used by HomebrewDJ.
 */
interface HomebrewDJConfig {
    hostname: string;
    midiInput: string;
    midiOutput: string;
    dawInput: string;
    dawOutput: string;
    traktorInput: string;
    traktorOutput: string;
}

/**
 * Main application controller.
 *
 * Connects the Launchpad, Traktor integration layer and web server,
 * and routes MIDI events between all components.
 */
export class HomebrewDJTraktorSetup {
    launchpad: Launchpad
    traktor: MidiDriver

    deckAAux: TraktorState
    deckBAux: TraktorState

    /**
     * WebSocket/HTTP server used by external clients to interact with Traktor.
     */
    server: Server;

    /**
     * Creates a HomebrewDJ instance from a configuration file.
     *
     * @param config_path Path to the JSON configuration file.
     */
    constructor(config_path = "./config.json") {
        const file = Deno.readTextFileSync(config_path);
        const config: HomebrewDJConfig = JSON.parse(file);

        this.server = new Server((msg: AllowedPayloads) => {
            console.log(msg);
            switch (msg.type) {
                case "cc":
                    {
                        const { cc, channel, value } = msg;
                        if (channel == 1) {
                            this.deckAAux.sendTraktorCC(cc, value);
                        } else if (channel == 2) {
                            this.deckBAux.sendTraktorCC(cc, value);
                        }
                    }
                    break;
                case "note":
                    {
                        const { note, channel, velocity } = msg;
                        if (channel == 1) {
                            this.deckAAux.sendTraktorMidi(note, velocity > 0);
                        } else if (channel == 2) {
                            this.deckBAux.sendTraktorMidi(note, velocity > 0)
                        }
                    }
                    break;
            }
        }, {
            hostname: config.hostname
        })

        this.launchpad = new Launchpad(
            new MidiDriver({
                inputName: config.midiInput,
                outputName: config.midiOutput,
                useVirtual: false
            }),
            new MidiDriver({
                inputName: config.dawInput,
                outputName: config.dawInput,
                useVirtual: false
            })
        );

        this.traktor = new MidiDriver({
            inputName: config.traktorInput,
            outputName: config.traktorOutput,
            useVirtual: true
        });


        this.deckAAux = new TraktorState(1, this.traktor);
        this.deckBAux = new TraktorState(2, this.traktor);

        this.traktor.addEventListener((ev: CustomEvent) => {
            const t = ev.detail;
            forwardMidiToServer({ t, server: this.server, systemChannel: 16 })
        })

        this.launchpad.loadSurface(LaunchpadSurfaceStore.Session, new TraktorSurface(this.traktor));
        this.launchpad.switchToDawMode();
    }

    /**
     * Gracefully shuts down all connected services and MIDI devices.
     */
    close() {
        this.launchpad.switchToStandaloneMode();
        this.launchpad.close();
        this.traktor.close();
        this.server.close();
    }
}

export class HomebrewDJControllerOnly {
    server: Server;
    midiPort: MidiDriver;

    oscPort: OscDriver;

    constructor(config_path = "./config.json", midiPort = new MidiDriver({
        inputName: "HomebrewDJ Controller Input",
        outputName: "HomebrewDJ Controller Output",
        useVirtual: true
    })) {
        this.midiPort = midiPort
        const file = Deno.readTextFileSync(config_path);
        const config: HomebrewDJConfig = JSON.parse(file);
        this.server = new Server((msg: AllowedPayloads) => {
            forwardWebsocketMessageToPorts({
                msg,
                midiPort: this.midiPort,
                oscPort: this.oscPort,
                server: this.server
            })
        }, {
            hostname: config.hostname
        });

        this.midiPort.addEventListener((ev: CustomEvent) => {
            const t = ev.detail;
            forwardMidiToServer({
                t,
                server: this.server,
                systemChannel: 16   // move to config somewhere
            })
        });

        this.oscPort = OscDriver.customHost("127.0.0.1", 8000);
        this.oscPort.addEventListener((msg: OscMessagePayload) => {
            console.log("osc payload", msg);
            this.server.broadcast(msg);
        });
    }

    close() {
        this.oscPort.stop();
        this.midiPort.close();
        this.server.close();
    }
}