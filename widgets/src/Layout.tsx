import { GridMixerProperties, HorizontalMixerProperties, VerticalMixerProperties } from "definitions";
import { Layout, WidgetProperties } from "./Parser.tsx";

export function Vertical({ def }: WidgetProperties<VerticalMixerProperties>) {
    //return (<div>{Layout(def.vert)}</div>)
    return <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "1em",
        width: "100%",
        height: "100%",
    }}>
        <Layout children={def.vert} />
    </div>
}

export function Horizontal({ def }: WidgetProperties<HorizontalMixerProperties>) {
    return (<div style={{
        display: "flex",
        flexDirection: "row",
        gap: "1em",
        width: "100%",
        height: "100%",
    }}>
        <Layout children={def.horiz} />
    </div>)

}

export function Grid({ def }: WidgetProperties<GridMixerProperties>) {
    return (<div className="grid">
        <Layout children={def.grid} />
    </div>)
}