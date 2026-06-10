import { Overlay, Widget } from "@hdj/definitions"
import { CCButton, NoteButton } from "./Button.tsx";
import { CCSlider } from "./Slider.tsx";
import { Grid, Horizontal, ShiftArea, TabbedArea, Vertical } from "./Layout.tsx";
import { Rotary } from "./Rotary.tsx";
import { XYPad } from "./XYPad.tsx";
import { Jogwheel } from "./Jogwheel.tsx";

export type ReceiveDataCallback = (v: number) => void;

export type SendNoteCallback = (channel: number, note: number, velocity: number, on: boolean) => void;
export type SendCCCallback = (channel: number, cc: number, value: number) => void;
export type RegisterCCCallback = (channel: number, cc: number, cb: ReceiveDataCallback) => string;
export type RegisterNoteCallback = (channel: number, note: number, cb: ReceiveDataCallback) => string;

export type UnregisterNoteCallback = (channel: number, note: number, id: string) => void;
export type UnregisterCCCallback = (channel: number, cc: number, id: string) => void;

export interface WidgetProperties<T> {
  def: T,
  callbacks: WidgetCallbacks
}

export interface WidgetCallbacks {
  /**
   * Sends out Note Data
   */
  sendNote: SendNoteCallback
  /**
   * registers this widget for input Note Data
   */
  registerNote: RegisterNoteCallback

  /**
   * Sends out CC Data
   */
  sendCC: SendCCCallback

  /**
   * registers this widget for input CC Data
   */
  registerCC: RegisterCCCallback

  /**
   * Unregisters this widget from input CC Data
   */
  unregisterCC: UnregisterCCCallback

  /**
   * Unregisters this widget from input Note Data
   */
  unregisterNote: UnregisterNoteCallback
}

export function Layout({ children, callbacks }: { children: Widget[], callbacks: WidgetCallbacks }) {
  return <>
    {children.map((def, k) => {
      switch (def.type) {
        case 'notebutton':
          return <NoteButton def={def} key={k} callbacks={callbacks} />
        case 'ccslider':
          return <CCSlider def={def} key={k} callbacks={callbacks} />
        case 'horiz-mixer':
          return <Horizontal def={def} key={k} callbacks={callbacks} />
        case 'vert-mixer':
          return <Vertical def={def} key={k} callbacks={callbacks} />
        case 'grid-mixer':
          return <Grid def={def} key={k} callbacks={callbacks} />
        case 'ccbutton':
          return <CCButton def={def} key={k} callbacks={callbacks} />
        case 'rotary':
          return <Rotary def={def} key={k} callbacks={callbacks} />
        case 'xypad':
          return <XYPad def={def} key={k} callbacks={callbacks} />
        case 'shift':
          return <ShiftArea def={def} key={k} callbacks={callbacks} />
        case 'jogwheel':
          return <Jogwheel def={def} key={k} callbacks={callbacks} />
        case 'tab':
          return <TabbedArea def={def} key={k} callbacks={callbacks} />
        case 'empty':
        default:
          return <div className="empty"></div>
      }
    })}
  </>
}

function testCallback(def: any, v: number) {
  console.log(def, v);
}

export function OverlayView({ o, callbacks, style }: { o: Overlay, callbacks: WidgetCallbacks, style?: React.CSSProperties }) {
  return (
    <div className="overlay" style={{
      //width: "calc(100% - 1em)",
      //height: "calc(100% - 1em)",
      width: "100%",
      height: "100%",
      display: "flex",
      gap: "1em",
      justifyContent: "center",
      ...style ?? {}
    }}>
      <Layout children={o.cells} callbacks={callbacks} />
    </div>
  )
}