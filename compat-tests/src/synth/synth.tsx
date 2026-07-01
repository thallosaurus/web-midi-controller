import { useEffect, useRef, useState } from "react"
import { EventbusWorkerClient, useEventBus, EventBusConsumer } from "../eventbus/client"
import { Overlay } from "../../bindings/Overlay"
import { LegacyOverlay } from "../widgets/legacy"

const SYNTH_OVERLAY: Overlay = {
    id: "synth_overlay",
    name: "Synth Overlay",
    channel: 1,
    program: 0,
    cells: [{
        type: "horiz-mixer",
        id: "0",
        horiz: [{
            type: "rotary",
            label: "Gain",
            mode: "relative",
            id: "1",
            channel: 1,
            cc: 1,
            value: 0,
            value_off: 0,
            default_value: 0
        }]
    }]
}

export const WebAudioSynthView = () => {
    const eventbus = useEventBus()
    const [running, setRunning] = useState<boolean>(false);
    const synth = useRef<SynthMain | null>(null);

    useEffect(() => {
        return () => {
            if (synth.current) synth.current.stop();
        }
    }, [])
    return (<div style={{
        height: "100%"
    }}>
        {
            running ?
                <div>
                    <LegacyOverlay overlay={SYNTH_OVERLAY}></LegacyOverlay>
                </div>
                : (
                    <div>
                        <button onClick={async () => {
                            synth.current = new SynthMain(eventbus);
                            await synth.current.start(setRunning)
                        }} type="button">
                            Start
                        </button>
                    </div>
                )
        }
    </div>)
}

class SynthMain {
    context: AudioContext;
    osc: OscillatorNode;
    gain: GainNode;

    eventbus: EventbusWorkerClient

    consumer: Map<string, SynthEventbusConsumer> = new Map();

    constructor(bus: EventbusWorkerClient) {
        this.eventbus = bus;
        this.context = new AudioContext();
        this.osc = this.context.createOscillator();
        this.gain = this.context.createGain();

        this.osc.type = "sawtooth";
        this.osc.frequency.value = 220;
        this.gain.gain.value = 0.2;
        this.osc.connect(this.gain);
        this.gain.connect(this.context.destination)
    }

    async start(setRunning?) {
        this.registerConsumer();
        this.osc.start();
        await this.context.resume();

        if (setRunning) setRunning(true);
    }

    async stop(setRunning?) {
        this.unregisterConsumer();
        this.osc.stop();
        await this.context.suspend()
        if (setRunning) setRunning(false);
    }

    async registerConsumer() {
        const c = new SynthEventbusConsumer(this.gain.gain, {
            channel: 1,
            cc: 1,
            default: 0x7F
        });
        const id = await this.eventbus.registerCC(c.prop.channel, c.prop.cc, c.prop.default, c)
        c.consumerId = id;
        this.consumer.set(id, c);
        //this.consumer.push(c);
    }

    async unregisterConsumer() {
        for (const [id, consumer] of this.consumer) {

            await this.eventbus.unregisterCC(consumer.consumerId, consumer.prop.channel, consumer.prop.cc);
            this.consumer.delete(id);
        }
    }
}

interface SynthEventbusConsumerProps {
    channel: number,
    cc: number,
    default: number
}

class SynthEventbusConsumer implements EventBusConsumer {
    consumerId: string;
    param: AudioParam
    public prop: SynthEventbusConsumerProps

    updateValue(v: number): void {
        this.param.value = v / 127;
    }
    sendValue(v: number): void {
        return  // synth doesnt send midi
        //throw new Error("Method not implemented.");
    }

    constructor(param, prop: SynthEventbusConsumerProps) {
        this.param = param;
        this.prop = prop;
    }
}