import { NoteButtonProperties, CCButtonProperties, Widget } from "definitions";
import { useEffect } from "react";
import { WidgetProperties } from "./Parser.tsx";

function Button(props: { label: string }) {
    return <div>{props.label}</div>
}

export function NoteButton({ def }: WidgetProperties<NoteButtonProperties>) {
    useEffect(() => console.log(def.note, def.label, def.mode));
    return <Button label={def.label} />
}

export function CCButton({ def }: WidgetProperties<CCButtonProperties>) {
    return (<Button label={def.label}/>)
}