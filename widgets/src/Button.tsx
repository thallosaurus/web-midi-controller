import { NoteButtonProperties, CCButtonProperties } from "widget-definitions";
import { useEffect } from "react";
import { WidgetProperties } from "./parser.tsx";

function Button(props: {}) {
    //useEffect(() => console.log(props.note, props.label, props.mode));
    return <></>
}

export function NoteButton({ def }: WidgetProperties<NoteButtonProperties>) {
    useEffect(() => console.log(def.note, def.label, def.mode));
    return Button(def)
}

export function CCButton({ def }: WidgetProperties<CCButtonProperties>) {
    return Button(def)
}