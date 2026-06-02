import { NoteButtonProperties, CCButtonProperties, Widget } from "definitions";
import { useEffect, useRef, useState } from "react";
import { WidgetProperties } from "./Parser.tsx";

function Button(props: { label: string }) {
    const [on, setOn] = useState(false);
    
    return <div className="btn-outer"
    onPointerDown={(ev) => {
        console.log("start", ev);
        setOn(true)
    }} onPointerMove={(ev) => {
        if (!on) return;
        console.log("move", ev);
    }} onPointerUp={(ev) => {
        console.log("end", ev);
        setOn(false)
    }}>
        <div className="btn-inner">
            {props.label}
        </div>
    </div>
}

export function NoteButton({ def }: WidgetProperties<NoteButtonProperties>) {
    useEffect(() => console.log(def.note, def.label, def.mode));
    return <Button label={def.label} />
}

export function CCButton({ def }: WidgetProperties<CCButtonProperties>) {
    return (<Button label={def.label} />)
}