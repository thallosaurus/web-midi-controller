import { CCSliderProperties } from "widget-definitions";
import { useEffect } from "react";

export function CCSlider(props: CCSliderProperties) {
    useEffect(() => console.log(props.cc, props.label, props.mode));
    return <></>
}