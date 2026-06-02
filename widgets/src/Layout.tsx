import { GridMixerProperties, HorizontalMixerProperties, VerticalMixerProperties } from "definitions";
import { Layout, WidgetProperties } from "./Parser.tsx";

export function Vertical({ def }: WidgetProperties<VerticalMixerProperties>) {
    //return (<div>{Layout(def.vert)}</div>)
    return <div className="vertical">
        <Layout children={def.vert} />
    </div>
}

export function Horizontal({ def }: WidgetProperties<HorizontalMixerProperties>) {
    return (<div className="horizontal">
        <Layout children={def.horiz} />
    </div>)

}

export function Grid({ def }: WidgetProperties<GridMixerProperties>) {
    return (<div className="grid">
        <Layout children={def.grid} />
    </div>)
}