import { sendEventBusInitCallback, sendInitCCWidget, sendInitNoteWidget, sendUnregisterCCCallback, sendUnregisterNoteCallback, sendUpdateCCWidget, sendUpdateNoteWidget } from "./message";
import { EventBusConsumerMessage, EventBusConsumerMessageType } from "./client"
let started = false;
type WidgetId = string;
type CCWidget = WidgetId[];
type CCChannel = Map<number, CCWidget>;
// midi_channel: CC number
const cc_map = new Map<number, CCChannel>();

type NoteWidget = WidgetId[];
type NoteChannel = Map<number, NoteWidget>;
const note_map = new Map<number, NoteChannel>();

// Messages for the event bus - stage 1
export function process_worker_message(msg: EventBusConsumerMessage) {
    //console.log("event bus message", m.data)

    switch (msg.type) {
        case EventBusConsumerMessageType.InitBus:
            try {

                initBus(msg.midi_channels)
                sendEventBusInitCallback();
            } catch (e) {
                console.error("error while initint event bus", e)
            }
            break;



        default:
            if (!started) throw new Error("event bus is not started")
            if (!process_consumer_message(msg)) {
                throw new Error("unknown message received")
            }
            break
    }
}

function initBus(channel_count: number) {
    if (started) throw new Error("event bus is already started");

    for (let ch = 0; ch < channel_count; ch++) {
        const cc_channel = new Map<number, [WidgetId]>();//Array<CCCallback>>();
        cc_map.set(ch + 1, cc_channel);   //index + 1 for convenience
    }

    for (let ch = 0; ch < channel_count; ch++) {
        const note_channel = new Map<number, [WidgetId]>();//Array<NoteCallback>>();
        note_map.set(ch + 1, note_channel);   //index + 1 for convenience
    }

    started = true;
}

// stage 2
function process_consumer_message(msg: EventBusConsumerMessage) {
    switch (msg.type) {
        case EventBusConsumerMessageType.RegisterCCWidget:
            //console.log("event bus consumer", "register cc widget", msg);
            register_cc_widget(msg.id, msg.value, msg.channel, msg.cc)
            return true;
        case EventBusConsumerMessageType.UnregisterCCWidget:
            unregister_cc_widget(msg.id, msg.channel, msg.cc);
            return true;
        case EventBusConsumerMessageType.RegisterNoteWidget:
            register_note_widget(msg.id, msg.channel, msg.note);
            return true;
        case EventBusConsumerMessageType.UnregisterNoteWidget:
            unregister_note_widget(msg.id, msg.channel, msg.note)
            return true;
        case EventBusConsumerMessageType.UpdateCCValue:
            cc_update_on_bus(msg.channel, msg.cc, msg.value, false);
            return true;
        case EventBusConsumerMessageType.ExternalCCUpdate:
            cc_update_on_bus(msg.channel, msg.cc, msg.value, true)
            return true;
        case EventBusConsumerMessageType.UpdateNoteValue:
            note_update_on_bus(msg.channel, msg.note, msg.velocity, false);
            return true;
        case EventBusConsumerMessageType.ExternalNoteUpdate:
            note_update_on_bus(msg.channel, msg.note, msg.velocity, true);
            return true;

        default:
            return false;
    }
}

// Register a CC Widget on the bus
const register_cc_widget = (id: string, init: number, channel: number, cc: number) => {
    const channel_map = cc_map.get(channel)!;
    if (!channel_map.has(cc)) {
        channel_map.set(cc, []);
    }
    console.log("registering " + id + " cc ", cc, " on channel ", channel);

    const c = channel_map.get(cc)!;
    //c.set(id, cb);
    c.push(id);
    //c.push(cb);

    //    cb(init);
    //send init cc message
    sendInitCCWidget(id, channel, cc, init)
};

const unregister_cc_widget = (id: string, channel: number, cc: number) => {
    const ccch = cc_map.get(channel)!;

    if (!ccch.has(cc)) {
        return
    }

    console.log("unregistering " + id + "  cc widget ", cc, " on channel ", channel);
    const ccmap = ccch.get(cc)!;

    const index = ccmap.findIndex((v, i) => {
        return v == id
    })

    // send unregister message
    sendUnregisterCCCallback(id)

    return ccmap.splice(index, 1);
}

// Update all widgets that are bound to the cc number
// TODO: make ext non optional
const cc_update_on_bus = (channel: number, cc: number, value: number, ext: boolean) => {
    const ch = cc_map.get(channel)!;

    if (!ch.has(cc)) return;

    for (const id of ch.get(cc)!) {
        // send update
        sendUpdateCCWidget(id, channel, cc, value, ext);
    }
}

// Register a midi widget on the bus
const register_note_widget = (id: string, channel: number, note: number) => {
    const ch = note_map.get(channel)!;

    if (!ch.has(note)) {
        ch.set(note, []);
    }

    console.log("registering " + id + " midi ", note, " on channel ", channel);
    const n = ch.get(note)!;
    n.push(id);

    sendInitNoteWidget(id, channel, note)
};

const unregister_note_widget = (id: string, channel: number, note: number) => {
    const notech = note_map.get(channel)!;

    if (!notech.has(note)) {
        return
    }

    console.log("unregistering " + id + " midi ", note, " on channel ", channel);
    const notemap = notech.get(note)!;
    const index = notemap.findIndex((v, i) => {
        return v == id
    })
    // send unregister message
    sendUnregisterNoteCallback(id);

    return notemap.splice(index, 1);
}

// Update all widgets bound to the midi number
const note_update_on_bus = (channel: number, note: number, velocity: number, ext: boolean) => {
    const ch = note_map.get(channel)!;

    if (!ch.has(note)) return;

    for (const id of ch.get(note)!) {
        //send update
        //cb(velocity)
        sendUpdateNoteWidget(id, channel, note, velocity, ext)
    }
};