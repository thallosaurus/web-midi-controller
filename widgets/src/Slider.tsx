import { CCSliderProperties } from "definitions";
import { WidgetProperties } from "./Parser.tsx";
import { useEffect } from "react";

export function CCSlider({ def }: WidgetProperties<CCSliderProperties>) {
    useEffect(() => console.log(def.cc, def.label, def.mode));
    return <>{def.label}</>
}