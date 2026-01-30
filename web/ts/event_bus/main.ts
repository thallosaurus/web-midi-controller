import { EventBusConsumerMessage, EventBusConsumerMessageType, EventBusProducerMessage, sendEventBusInitCallback, sendInitCCWidget, sendInitNoteWidget, sendUnregisterCCCallback, sendUnregisterNoteCallback, sendUpdateCCWidget, sendUpdateNoteWidget } from "./message";

let started = false;
type WidgetId = string;
type CCWidget = WidgetId[];//Array<CCCallback>;
type CCChannel = Map<number, CCWidget>;
// midi_channel: CC number
const cc_map = new Map<number, CCChannel>();

type NoteWidget = WidgetId[];//Array<NoteCallback>;
type NoteChannel = Map<number, NoteWidget>;
const note_map = new Map<number, NoteChannel>();



// Messages for the event bus
onmessage = (m) => {
    //console.log("event bus message", m.data)
    const msg: EventBusConsumerMessage = m.data;
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
            process_consumer_message(m.data)
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

function process_consumer_message(msg: EventBusConsumerMessage) {
    console.log("event bus consumer", "processing consumer message", msg);
    switch (msg.type) {
        case EventBusConsumerMessageType.RegisterCCWidget:
            return register_cc_widget(msg.id, msg.value ?? 0, msg.channel, msg.cc)
        case EventBusConsumerMessageType.UnregisterCCWidget:
            return unregister_cc_widget(msg.id, msg.channel, msg.cc);
        case EventBusConsumerMessageType.RegisterNoteWidget:
            return register_note_widget(msg.id, msg.channel, msg.note)
        case EventBusConsumerMessageType.UnregisterNoteWidget:
            return unregister_note_widget(msg.id, msg.channel, msg.note)
        default:
            return false;
    }
}

// Register a CC Widget on the bus
export const register_cc_widget = (id: string, init: number, channel: number, cc: number) => {
    const channel_map = cc_map.get(channel)!;
    if (!channel_map.has(cc)) {
        channel_map.set(cc, []);
    }
    console.log("registering cc ", cc, " on channel ", channel);

    const c = channel_map.get(cc)!;
    //c.set(id, cb);
    c.push(id);
    //c.push(cb);

    //    cb(init);
    //send init cc message
    sendInitCCWidget(id, channel, cc, init)
};

export const unregister_cc_widget = (id: string, channel: number, cc: number) => {
    const ccch = cc_map.get(channel)!;

    if (!ccch.has(cc)) {
        return
    }

    console.log("unregistering cc widget ", cc, " on channel ", channel);
    const ccmap = ccch.get(cc)!;

    const index = ccmap.findIndex((v, i) => {
        return v == id
    })

    // send unregister message
    sendUnregisterCCCallback(id)

    return ccmap.splice(index, 1);
}

// Update all widgets that are bound to the cc number
export const cc_update_on_bus = (channel: number, cc: number, value: number) => {
    const ch = cc_map.get(channel)!;

    if (!ch.has(cc)) return;

    for (const id of ch.get(cc)!) {
        // send update
        sendUpdateCCWidget(id, channel, cc, value);
    }

    /*for (const [_, cb] of new Map(ch.get(cc))!) {
        //console.log("updating " + cc);

        cb(value);

    }*/
};

// Register a midi widget on the bus
export const register_note_widget = (id: string, channel: number, note: number) => {
    const ch = note_map.get(channel)!;

    if (!ch.has(note)) {
        ch.set(note, []);
    }

    console.log("registering midi ", note, " on channel ", channel);
    const n = ch.get(note)!;
    n.push(id);
    //n.set(id, cb)
    //send init message
    sendInitNoteWidget(id, channel, note)
};

export const unregister_note_widget = (id: string, channel: number, note: number) => {
    const notech = note_map.get(channel)!;

    if (!notech.has(note)) {
        return
    }

    console.log("unregistering midi ", note, " on channel ", channel);
    const notemap = notech.get(note)!;
    const index = notemap.findIndex((v, i) => {
        return v == id
    })
    // send unregister message
    sendUnregisterNoteCallback(id);

    return notemap.splice(index, 1);
}

// Update all widgets bound to the midi number
export const note_update_on_bus = (channel: number, note: number, velocity: number) => {
    const ch = note_map.get(channel)!;

    if (!ch.has(note)) return;

    for (const id of ch.get(note)!) {
        //send update
        //cb(velocity)
        sendUpdateNoteWidget(id, channel, note, velocity)
    }
};

/*/// Gets called, when the websocket client gets a message from another peer
export const process_external = (data: MidiEvent) => {
    //bus.dispatchEvent(ev);
    //const data = JSON.parse(msg);
    console.log(data);
    switch (data.event_name) {
        case "ccupdate":
            {
                const data_t = data as CCEvent;
                bus.dispatchEvent(
                    new CCEvent(data_t.midi_channel, data_t.value, data_t.cc),
                );
            }
            break;

        case "noteupdate":
            {
                const data_t = data as NoteEvent;
                bus.dispatchEvent(
                    new NoteEvent(
                        data_t.midi_channel,
                        data_t.note,
                        data_t.on,
                        data_t.velocity,
                    ),
                );
            }
            break;
    }
};

/// Should be called when an widget gets modified to update the state
// and send it to the server which broadcasts it around
export const process_internal = (ev: MidiEvent) => {

    //send(JSON.stringify(ev));
    //FrontendSocketEvent(ev);
    bus.dispatchEvent(ev);
};
/*
export const bus = new EventTarget();
export const init_event_bus = () => {
    init_backend_maps();

    bus.addEventListener("ccupdate", (ev: Event) => {
        const update = ev as CCEvent;
        cc_update_on_bus(update.midi_channel, update.cc, update.value);
        //console.log(update);
    });
    bus.addEventListener("noteupdate", (ev: Event) => {
        const update = ev as NoteEvent;
        midi_update_on_bus(update.midi_channel, update.note, update.velocity);
    });
}
*/