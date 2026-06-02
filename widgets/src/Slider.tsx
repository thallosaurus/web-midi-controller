import { CCSliderProperties } from "widget-definitions";
import { useEffect } from "react";
import { WidgetProperties } from "./parser.tsx";

export function CCSlider({ def }: WidgetProperties<CCSliderProperties>) {
    useEffect(() => console.log(def.cc, def.label, def.mode));
    return <></>
}