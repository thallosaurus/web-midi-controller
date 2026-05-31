import { MidiDriver } from "@driver-deno";
import { TraktorState } from "../state.ts";

const port = new MidiDriver({
    "inputName": "test virtual input",
    "outputName": "test virtual output",
    useVirtual: true
});

const state = new TraktorState(1, port);
state.addEventListener((ev) => {
    const evt = ev as CustomEvent;

    console.log(evt.detail)
})

let b = true;

setInterval(() => {
    //state.play = b
    //state.vol = b ? 127 : 0
    //state.lowkill = b;
    //b = !b;
    state.backward();
}, 1000);