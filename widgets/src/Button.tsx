import { NoteButtonProperties, CCSliderProperties } from "widget-definitions";
import { useEffect } from "react";

export function Button(props: NoteButtonProperties) {
    //useEffect(() => console.log(props.note, props.label, props.mode));
    return <></>
}

export function NoteButton(props: NoteButtonProperties) {
    useEffect(() => console.log(props.note, props.label, props.mode));
    return Button(props)
}