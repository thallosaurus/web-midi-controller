import { GridMixerProperties, HorizontalMixerProperties, ShiftAreaProperties, TabbedViewProperties, VerticalMixerProperties, Widget } from "@hdj/definitions";
import { WidgetProperties } from "./Parser";
import { Children, CSSProperties, ReactNode, useEffect, useState } from "react";
import { useWidgetAction } from "./Callbacks";

function Panel({ id, type, style, children }: { id: string, type: string, style: CSSProperties, children: ReactNode }) {
    return <div id={id} className={`widget ${type}`} style={{
        display: "flex",
        //flexDirection: "column",
        gap: "1em",
        width: "100%",
        height: "100%",
        ...style
    }}>
        {children}
    </div>
}

export function Vertical({ def, children }: WidgetProperties<Widget & VerticalMixerProperties> & { children: ReactNode }) {
    //return (<div>{Layout(def.vert)}</div>)
    return <Panel id={def.id} type="vert-mixer" style={{
        flexDirection: "column"
    }}>
        {children}
    </Panel>
}

export function Horizontal({ def, children }: WidgetProperties<Widget & HorizontalMixerProperties> & { children: ReactNode }) {
    return <Panel id={def.id} type="horiz-mixer" style={{
        flexDirection: "row"
    }}>
        {children}
    </Panel>

}

export function Grid({ def, children }: WidgetProperties<Widget & GridMixerProperties> & { children: ReactNode }) {
    return (
        <Panel id={def.id} type="grid-mixer" style={{
            display: "grid",
            gridTemplateColumns: `repeat(${def.h}, 1fr)`,
            gridTemplateRows: `repeat(${def.w}, 1fr)`,
        }}>

            {children}
        </Panel>)
}

const shiftPanelAVisible = (shift: boolean) => {
    return { display: shift ? "none" : "block" }
}

const shiftPanelBVisible = (shift: boolean) => {
    return { display: shift ? "block" : "none" }
}

export function ShiftArea({ def, children }: WidgetProperties<ShiftAreaProperties> & { children: ReactNode[] }) {
    const [shift, setShift] = useState(false);
    const callbacks = useWidgetAction();

    useEffect(() => {
        const id = callbacks.register(def, (v) => setShift(v > 64))
        return () => {
            callbacks.unregister(id, def);
        }
    }, [])

    return (<div id={def.id} className="shift">
        {children.map((v, i) => {
            return <div className="panel" style={{
                
            }}>{v}</div>
        })}
    </div>)

    /*return (<div id={def.id} className="shift">
        <div className="panel a" style={{
            ...shiftPanelAVisible(shift)
        }}>
            <Layout children={def.a} />
        </div>
        <div className="panel b" style={{
            ...shiftPanelBVisible(shift)
        }}>
            <Layout children={def.b} />
        </div>
    </div>)*/
}

export function TabbedArea({ def, children }: WidgetProperties<TabbedViewProperties> & { children: ReactNode }) {
    const [tab, setCurrentTab] = useState(0);

    return (
        <div className="tab" id={def.id}>
            {children}
        </div>
    )
}