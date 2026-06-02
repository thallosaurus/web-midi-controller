import { GridMixerProperties, HorizontalMixerProperties, VerticalMixerProperties } from "widget-definitions";
import { Layout, WidgetProperties } from "./parser.tsx";

export function Vertical({ def }: WidgetProperties<VerticalMixerProperties>) {
    return (<div>{Layout(def.vert)}</div>)
}

export function Horizontal({ def }: WidgetProperties<HorizontalMixerProperties>) {
    return (<div>{Layout(def.horiz)}</div>)
}

export function Grid({ def }: WidgetProperties<GridMixerProperties>) {
    return (<div>{Layout(def.grid)}</div>)
}