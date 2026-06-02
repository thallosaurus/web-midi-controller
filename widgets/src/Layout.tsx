import { GridMixerProperties, HorizontalMixerProperties, VerticalMixerProperties } from "definitions";
import { Layout, WidgetProperties } from "./Parser.tsx";

export function Vertical({ def, callback }: WidgetProperties<VerticalMixerProperties>) {
    //return (<div>{Layout(def.vert)}</div>)
    return <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "1em",
        width: "100%",
        height: "100%",
    }}>
        <Layout children={def.vert} callback={callback}/>
    </div>
}

export function Horizontal({ def, callback }: WidgetProperties<HorizontalMixerProperties>) {
    return (<div style={{
        display: "flex",
        flexDirection: "row",
        gap: "1em",
        width: "100%",
        height: "100%",
    }}>
        <Layout children={def.horiz} callback={callback} />
    </div>)

}

export function Grid({ def, callback }: WidgetProperties<GridMixerProperties>) {
    return (<div className="grid">
        <Layout children={def.grid} callback={callback} />
    </div>)
}