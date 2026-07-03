import { GridMixerProperties, HorizontalMixerProperties, ShiftAreaProperties, TabbedViewProperties, VerticalMixerProperties, Widget } from "@hdj/definitions";
import { Layout, WidgetProperties } from "./Parser.tsx";
import { useEffect, useState } from "react";
import { useWidgetAction } from "./Callbacks.tsx";

export function Vertical({ def }: WidgetProperties<VerticalMixerProperties> & { aux?: React.ReactElement }) {
    //return (<div>{Layout(def.vert)}</div>)
    return <div id={def.id} className="widget vert-mixer" style={{
        display: "flex",
        flexDirection: "column",
        gap: "1em",
        width: "100%",
        height: "100%",
    }}>
        <Layout children={def.vert} />
    </div>
}

export function Horizontal({ def }: WidgetProperties<HorizontalMixerProperties> & { aux?: React.ReactElement }) {
    return (<div id={def.id} className="widget horiz-mixer" style={{
        display: "flex",
        flexDirection: "row",
        gap: "1em",
        width: "100%",
        height: "100%",
    }}>
        <Layout children={def.horiz} />
    </div>)

}

export function Grid({ def }: WidgetProperties<GridMixerProperties> & { aux?: React.ReactElement }) {
    return (<div id={def.id} className="widget grid" style={{
        display: "grid",
        gridTemplateColumns: `repeat(${def.h}, 1fr)`,
        gridTemplateRows: `repeat(${def.h}, 1fr)`,
        width: "100%",
        height: "100%",
        gap: "1em"
    }}>
        <Layout children={def.grid} />
    </div>)
}

export function ShiftArea({ def }: WidgetProperties<ShiftAreaProperties> & { aux?: React.ReactElement }) {
    const [shift, setShift] = useState(false);
    const callbacks = useWidgetAction();
    useEffect(() => {
        callbacks.register(def, (v) => {
            setShift(v > 64);
        })
    }, [])
    return (<div id={def.id} className="shift">
        <div className="panel a" style={{
            display: shift ? "none": "block"
        }}>
            <Layout children={def.a} />
        </div>
        <div className="panel b" style={{
            display: shift ? "block": "none"
        }}>
            <Layout children={def.b} />
        </div>
    </div>)
}

export function TabbedArea({ def }: WidgetProperties<TabbedViewProperties>) {
    const [tab, setCurrentTab] = useState(0);

    return (
        <div className="tab" id={def.id}>
            <Layout children={def.tabs} />
        </div>
    )
}