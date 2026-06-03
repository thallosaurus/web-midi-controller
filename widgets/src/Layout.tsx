import { GridMixerProperties, HorizontalMixerProperties, VerticalMixerProperties } from "definitions";
import { Layout, WidgetProperties } from "./Parser.tsx";

export function Vertical({ def, sendCCCallback, sendNoteCallback }: WidgetProperties<VerticalMixerProperties>) {
    //return (<div>{Layout(def.vert)}</div>)
    return <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "1em",
        width: "100%",
        height: "100%",
    }}>
        <Layout children={def.vert} sendCCCallback={sendCCCallback} sendNoteCallback={sendNoteCallback}/>
    </div>
}

export function Horizontal({ def, sendCCCallback, sendNoteCallback }: WidgetProperties<HorizontalMixerProperties>) {
    return (<div style={{
        display: "flex",
        flexDirection: "row",
        gap: "1em",
        width: "100%",
        height: "100%",
    }}>
        <Layout children={def.horiz} sendCCCallback={sendCCCallback} sendNoteCallback={sendNoteCallback} />
    </div>)

}

export function Grid({ def, sendCCCallback, sendNoteCallback }: WidgetProperties<GridMixerProperties>) {
    return (<div className="grid" style={{
        display: "grid",
        gridTemplateColumns: `repeat(${def.h}, 1fr)`,
        gridTemplateRows: `repeat(${def.h}, 1fr)`,
        width: "100%",
        height: "100%"
    }}>
        <Layout children={def.grid} sendCCCallback={sendCCCallback} sendNoteCallback={sendNoteCallback} />
    </div>)
}