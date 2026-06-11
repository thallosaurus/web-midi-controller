import { TraktorSurface, TraktorState, TraktorEvent } from "@hdj/traktor-driver"
import { Launchpad, LaunchpadSurfaceStore } from "@hdj/launchpad-driver";
import { MidiDriver } from "@hdj/midi-driver/ffi";

import { Server } from "./server.ts";
import { AllowedPayloads } from "./client/protocol.ts";

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
                        const { note, channel, on } = msg;
                        if (channel == 1) {
                            this.deckAAux.sendTraktorMidi(note, on);
                        } else if (channel == 2) {
                            this.deckBAux.sendTraktorMidi(note, on)
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

            switch (t.type) {
                case "NoteOn":
                case "NoteOff":
                    this.server.broadcast({
                        type: "note",
                        channel: t.channel,
                        note: t.note,
                        on: t.type == "NoteOn",
                        velocity: t.velocity
                    });

                    break;
                case "ControlChange":
                    this.server.broadcast({
                        type: "cc",
                        channel: t.channel,
                        cc: t.cc,
                        value: t.value
                    });
                    break;
            }
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
    midiPort = new MidiDriver({
        inputName: "HomebrewDJ Controller Input",
        outputName: "HomebrewDJ Controller Output",
        useVirtual: true
    });

    constructor(config_path = "./config.json") {
        const file = Deno.readTextFileSync(config_path);
        const config: HomebrewDJConfig = JSON.parse(file);
        this.server = new Server((msg: AllowedPayloads) => {
            switch (msg.type) {
                case "cc":
                    this.midiPort.sendMidi({
                        type: "ControlChange",
                        cc: msg.cc,
                        channel: msg.channel,
                        value: msg.value
                    })
                    break;
                case "note":
                    if (msg.on) {
                        this.midiPort.sendMidi({
                            type: "NoteOn",
                            channel: msg.channel,
                            note: msg.note,
                            velocity: msg.velocity
                        });
                    } else {
                        this.midiPort.sendMidi({
                            type: "NoteOff",
                            channel: msg.channel,
                            note: msg.note,
                            velocity: msg.velocity
                        });
                    }
                    break;
            }
        }, {
            hostname: config.hostname
        });

        this.midiPort.addEventListener((ev: CustomEvent) => {
            const t = ev.detail;

            switch (t.type) {
                case "NoteOn":
                case "NoteOff":
                    this.server.broadcast({
                        type: "note",
                        channel: t.channel,
                        note: t.note,
                        on: t.type == "NoteOn",
                        velocity: t.velocity
                    });
                    break;
                case "ControlChange":
                    this.server.broadcast({
                        type: "cc",
                        channel: t.channel,
                        cc: t.cc,
                        value: t.value
                    });
                    break;
            }
        })
    }

    close() {
        this.midiPort.close();
        this.server.close();
    }
}