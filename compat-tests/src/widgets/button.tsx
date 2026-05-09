// MARK: React Extension

import { FC, useState, useRef, useEffect } from "react";
import { NoteButtonProperties } from "../../bindings/Widget";
import { vibrate } from "../common/ui_utils";
import { useEventBus, EventBusConsumer } from "../eventbus/client";

export const ReactNoteButton: FC<{ p: NoteButtonProperties }> = ({ p }) => {
    const eventbus = useEventBus();
    const [label, setLabel] = useState<string>(p.label);
    const activePointer = useRef<number | null>(null);

    const [value, setValue] = useState<boolean>(false);

    const targetRef = useRef<HTMLDivElement | null>(null);
    const consumerId = useRef<string | null>(null);

    // the object responsible for updating the value
    const consumerRef = useRef<EventBusConsumer>({
        consumerId: null,
        updateValue(v) {
            setValue(v > 0);
        },
        sendValue(v) {
            eventbus.updateNote(p.channel, p.note, v ? 127 : 0)
        },
    })

    useEffect(() => {

        const consumer = consumerRef.current;
        if (!consumer) return;

        eventbus.registerNote(p.channel, p.note, consumer)
            .then(id => {
                //this.consumerId = id;
                consumerId.current = id;
            });
        return () => {
            eventbus.unregisterNote(consumerId.current, p.channel, p.note).then(id => {
                //state.id
                consumerId.current = null
            });
        }
    }, [eventbus]);

    useEffect(() => {
        const el = targetRef.current;
        if (!el) return;

        const touch_start = (e: PointerEvent) => {
            e.preventDefault();
            vibrate();
            //const el = e.currentTarget as HTMLElement;
            //this.state.active_pointer = e.pointerId;
            activePointer.current = e.pointerId;
            el.setPointerCapture(e.pointerId);

            eventbus.updateNote(p.channel, p.note, 127);

            //if (options.mode == "trigger") {
            //this.state.latch_on = true;
            //touch_update();
            //}

        };

        const touch_end = (e: PointerEvent) => {
            if (e.pointerId !== activePointer.current) return;

            el.releasePointerCapture(e.pointerId);
            activePointer.current = null;

            //el.classList.remove("press");
            eventbus.updateNote(p.channel, p.note, 0);

            /*            if (options.mode == "trigger") {
                this.state.latch_on = false;
                    } else if (options.mode == "latch") {
                        this.state.latch_on = !this.state.latch_on;
                    }*/
            //touch_update();
        };

        const touch_update = () => {
            //this.sendUpdate(this.state.latch_on ? 127 : 0)

        };

        el.addEventListener("pointerdown", touch_start);
        //targetRef.current.addEventListener("touchmove", touch_start);
        el.addEventListener("pointerup", touch_end);
        return () => {
            el.removeEventListener("pointerdown", touch_start);
            //targetRef.current.addEventListener("touchmove", touch_start);
            el.removeEventListener("pointerup", touch_end);
        }
    }, [])

    /*useEffect(() => {
        
    }, [value]);*/

    return (<div className="widget notebutton">
        <div className="target" ref={targetRef}>
            { String(value) }
        </div>
    </div>)
}