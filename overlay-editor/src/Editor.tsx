import { CCButtonProperties, CCSliderProperties, GridMixerProperties, HorizontalMixerProperties, NoteButtonProperties, Overlay, VerticalMixerProperties, Widget } from "@hdj/definitions";
import { useRef } from "react";

function HorizontalMixerEditor({ widget }: { widget: Widget & HorizontalMixerProperties }) {
    return <>
        <li><b>{widget.type}</b><button>Add</button></li>
        <li>Id {widget.id}</li>
        <ul>{widget.horiz.map((v, i) => <WidgetEditorTree key={i} widget={v} />)}</ul>
    </>

}
function VerticalMixerEditor({ widget }: { widget: Widget & VerticalMixerProperties }) {
    return <>
        <li><b>{widget.type}</b><button>Add</button></li>
        <li>Id {widget.id}</li>
        <ul>{widget.vert.map((v, i) => <WidgetEditorTree key={i} widget={v} />)}</ul>
    </>
}
function GridMixerEditor({ widget }: { widget: Widget & GridMixerProperties }) {
    return <>
        <li><b>{widget.type}</b><button>Add</button></li>
        <li>Width: {widget.w}</li>
        <li>Height: {widget.h}</li>
        <li>Id {widget.id}</li>
        <ul>{widget.grid.map((v, i) => <WidgetEditorTree key={i} widget={v} />)}</ul>
    </>
}

function NoteButtonEditor({ widget }: { widget: Widget & NoteButtonProperties }) {
    return <>
        <li><b>{widget.type}</b></li>
        <li>Label: {widget.label}</li>
        <li>Note: {widget.note}</li>
        <li>Output: {widget.output}</li>
        <li>Mode: {widget.mode}</li>
    </>
}

function CCButtonEditor({ widget }: { widget: Widget & CCButtonProperties }) {
    return <>
        <li><b>{widget.type}</b></li>
        <li>Label: {widget.label}</li>
        <li>CC: {widget.cc}</li>
        <li>Default Value: {widget.default_value}</li>
        <li>Value: {widget.value}</li>
        <li>Value Off: {widget.value_off}</li>
        <li>Output: {widget.output}</li>
        <li>Mode: {widget.mode}</li>
    </>
}

function CCSliderEditor({ widget }: { widget: Widget & CCSliderProperties }) {
    return <>
        <li><b>{widget.type}</b></li>
        <li>Label: {widget.label}</li>
        <li>CC: {widget.cc}</li>
        <li>Default Value: {widget.default_value}</li>
        <li>Value: {widget.value}</li>
        <li>Value Off: {widget.value_off}</li>
        <li>Output: {widget.output}</li>
        <li>Mode: {widget.mode}</li>
    </>
}

function WidgetEditorTree({ widget }: { widget: Widget }) {
    const widgetRef = useRef(widget);
    return <>
        {stringToWidget(widgetRef.current)}
    </>
}


export function OverlayEditorTree({ overlay }: { overlay: Overlay }) {
    const overlayRef = useRef(overlay);

    return (
        <ul>
            <li>Name: {overlayRef.current.name}</li>
            <li>Channel: {overlayRef.current.channel}</li>
            <li>Id: {overlayRef.current.id}</li>
            <li>Program Change Id: {overlayRef.current.program}</li>
            <li>
                <div>Widgets:</div>
                <ul>
                    {overlayRef.current.cells.map((v, i) =>
                        <WidgetEditorTree key={i} widget={v} />
                    )}
                </ul>
            </li>
        </ul>
    )
}

function stringToWidget(widget: Widget) {
    switch (widget.type) {
        case "horiz-mixer":
            return <HorizontalMixerEditor widget={widget} />
        case "vert-mixer":
            return <VerticalMixerEditor widget={widget} />
        case "grid-mixer":
            return <GridMixerEditor widget={widget} />
        case "notebutton":
            return <NoteButtonEditor widget={widget} />
        case "ccslider":
            return <CCSliderEditor widget={widget} />
        case "ccbutton":
            return <CCButtonEditor widget={widget} />
        case "rotary":
            return (
                <li>Id {widget.id}</li>
            )
        case "jogwheel":
            return (
                <li>Id {widget.id}</li>
            )
        case "xypad":
            return (
                <li>Id {widget.id}</li>
            )
        case "empty":
            return (
                <li>Empty</li>
            )
        case "shift":
            return (
                <li>Id {widget.id}</li>
            )
        case "tab":
            return (
                <li>Id {widget.id}</li>
            )
    }
}