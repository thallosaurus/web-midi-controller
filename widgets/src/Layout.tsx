import { GridMixerProperties, HorizontalMixerProperties, ShiftAreaProperties, TabbedViewProperties, VerticalMixerProperties } from "@hdj/definitions";
import { Layout, WidgetProperties } from "./Parser.tsx";
import { useEffect, useState } from "react";

export function Vertical({ def, callbacks, aux }: WidgetProperties<VerticalMixerProperties> & { aux?: React.ReactElement }) {
    //return (<div>{Layout(def.vert)}</div>)
    return <div id={def.id} className="vert-mixer" style={{
        display: "flex",
        flexDirection: "column",
        gap: "1em",
        width: "100%",
        height: "100%",
    }}>
        <Layout children={def.vert} callbacks={callbacks} aux={aux} />
    </div>
}

export function Horizontal({ def, callbacks, aux }: WidgetProperties<HorizontalMixerProperties> & { aux?: React.ReactElement }) {
    return (<div id={def.id} className="horiz-mixer" style={{
        display: "flex",
        flexDirection: "row",
        gap: "1em",
        width: "100%",
        height: "100%",
    }}>
        <Layout children={def.horiz} callbacks={callbacks} aux={aux} />
    </div>)

}

export function Grid({ def, callbacks, aux }: WidgetProperties<GridMixerProperties> & { aux?: React.ReactElement }) {
    return (<div id={def.id} className="grid" style={{
        display: "grid",
        gridTemplateColumns: `repeat(${def.h}, 1fr)`,
        gridTemplateRows: `repeat(${def.h}, 1fr)`,
        width: "100%",
        height: "100%",
        gap: "1em"
    }}>
        <Layout children={def.grid} callbacks={callbacks} aux={aux} />
    </div>)
}

export function ShiftArea({ def, callbacks }: WidgetProperties<ShiftAreaProperties> & { aux?: React.ReactElement }) {
    const [shift, setShift] = useState(false);
    useEffect(() => {
        callbacks.registerNote(def.channel, def.note, (v) => {
            setShift(v > 64);
        })
    })
    return (<div id={def.id} className="shift">
        <div className="panel a" style={{
            display: shift ? "none": "block"
        }}>
            <Layout children={def.a} callbacks={callbacks} />
        </div>
        <div className="panel b" style={{
            display: shift ? "block": "none"
        }}>
            <Layout children={def.b} callbacks={callbacks} />
        </div>
    </div>)
}

export function TabbedArea({ def, callbacks }: WidgetProperties<TabbedViewProperties>) {
    const [tab, setCurrentTab] = useState(0);

    return (
        <div className="tab" id={def.id}>
            <Layout children={def.tabs} callbacks={callbacks} />
        </div>
    )
}