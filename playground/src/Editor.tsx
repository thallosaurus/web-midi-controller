import { createMidiNoteButton, type Overlay, type Widget } from "@hdj/definitions"
import { WCallbacks, WidgetActionContext, WidgetCell, type Outgoing } from "@hdj/widgets"
import { useRef, useState } from "react"

class Bus extends WCallbacks {
    sender: Outgoing | null = null
}

class Editor {
    
}

const widgetSelectorToEditorObject = (w: EditorWidgetSelector, children: Widget[] = []): Widget => {
    switch (w) {
        case EditorWidgetSelector.VertMixer:
            return {
                "type": "vert-mixer",
                "id": null,
                "vert": children
            }
        case EditorWidgetSelector.HorizMixer:
            return {
                "type": "horiz-mixer",
                "id": null,
                "horiz": children
            }
        case EditorWidgetSelector.NoteButton:
            return {
                "type": "notebutton",
                "id": null,
                "mode": "trigger",
                "output": "midi",
                "note": 60,
                "label": "test",
                "channel": 1
            }
        case EditorWidgetSelector.CCButton:
            return {
                "type": "ccbutton",
                "id": null,
                "mode": "trigger",
                "output": "midi",
                "cc": 2,
                "channel": 1,
                "label": "test",
                "value": null
            }

        case EditorWidgetSelector.GridMixer:
            return {
                "type": "grid-mixer",
                "id": null,
                "h": 3,
                "w": 3,
                "grid": children
            }
    }
}

enum EditorWidgetSelector {
    VertMixer = "vert-mixer",
    HorizMixer = "horiz-mixer",
    GridMixer = "grid-mixer",
    NoteButton = "notebutton",
    CCButton = "ccbutton"
}

const WidgetSelectorHtml = ({ setValue }: { setValue: (e: EditorWidgetSelector) => void }) => {
    const [selectedValue, setSelectedValue] = useState(EditorWidgetSelector.VertMixer);

    return <form onSubmit={(ev) => {
        ev.preventDefault();
        setValue(selectedValue)
    }}>
        <select value={selectedValue} onChange={(e) => {
            setSelectedValue(e.target.value as EditorWidgetSelector);
        }}>
            <option value={EditorWidgetSelector.VertMixer}>Vertical Mixer</option>
            <option value={EditorWidgetSelector.HorizMixer}>Horizontal Mixer</option>
            <option value={EditorWidgetSelector.GridMixer}>Grid Mixer</option>
            <option value={EditorWidgetSelector.NoteButton}>Note Button</option>
            <option value={EditorWidgetSelector.CCButton}>CC Button</option>
        </select>
        <button type="submit">+</button>
    </form>
}

export const EditorCell = ({ w }: { w: Widget | null }) => {
    //return <><p>editor cell</p></>

    const [props, setWidgetProperties] = useState(w ?? widgetSelectorToEditorObject(EditorWidgetSelector.VertMixer))

    return (
        <div>
            <WidgetSelectorHtml setValue={(w) => {
                setWidgetProperties(widgetSelectorToEditorObject(w));
            }} />
            <div>over widget</div>
            <WidgetCell def={props} />
        </div>
    )
}

export const EditorOverlayView = ({ o }: { o?: Overlay }) => {
    const [overlay, setOverlay] = useState(o);

    return <WidgetActionContext value={new Bus()}>
        <div style={{
            border: "1px solid red"
        }}>

            <WidgetSelectorHtml setValue={(w) => {
                const ww = widgetSelectorToEditorObject(w);
                /*setOverlay({
                    ...overlay,
                    cells: [ww]
                    }
                )*/
            }} />

            <div>

                {/*overlay.cells.map((w, i) => {
                    return <EditorCell w={w} />
                })*/}
            </div>
        </div>
    </WidgetActionContext>
}