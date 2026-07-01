import { Overlay, Widget } from "@hdj/definitions"
import { CCButton, NoteButton } from "./Button.tsx";
import { CCSlider } from "./Slider.tsx";
import { Grid, Horizontal, ShiftArea, TabbedArea, Vertical } from "./Layout.tsx";
import { Rotary } from "./Rotary.tsx";
import { XYPad } from "./XYPad.tsx";
import { Jogwheel } from "./Jogwheel.tsx";
import { ReactElement } from "react";

export type MIDIReceiveDataCallback = (v: number) => void;
export type OSCReceiveDataCallback = (v: number) => void;

export type MIDISendNoteCallback = (channel: number, note: number, velocity: number, on: boolean) => void;
export type MIDISendCCCallback = (channel: number, cc: number, value: number) => void;
export type MIDIRegisterCCCallback = (channel: number, cc: number, cb: MIDIReceiveDataCallback) => string;
export type MIDIRegisterNoteCallback = (channel: number, note: number, cb: MIDIReceiveDataCallback) => string;

export type MIDIUnregisterNoteCallback = (channel: number, note: number, id: string) => void;
export type MIDIUnregisterCCCallback = (channel: number, cc: number, id: string) => void;

export type OSCRegister = (address: string, cb: OSCReceiveDataCallback) => string;
export type OSCUnregister = (address: string, id: string) => void;
export type OSCSend = (address: string, args: any[]) => void;

export interface WidgetProperties<T> {
  def: T,
  callbacks: WidgetCallbacks,
}

export type WidgetCallbacks = MIDIWidgetCallbacks & OSCWidgetCallbacks & UiEventCallbacks;

export interface UiEventCallbacks {
  sendUiEvent: (def: Widget) => void;
}

export interface OSCWidgetCallbacks {
  registerOSC: OSCRegister
  unregisterOSC: OSCUnregister
  sendOSC: OSCSend
}

export interface MIDIWidgetCallbacks {
  /**
   * Sends out Note Data
   */
  sendNote: MIDISendNoteCallback
  /**
   * registers this widget for input Note Data
   */
  registerNote: MIDIRegisterNoteCallback

  /**
   * Sends out CC Data
   */
  sendCC: MIDISendCCCallback

  /**
   * registers this widget for input CC Data
   */
  registerCC: MIDIRegisterCCCallback

  /**
   * Unregisters this widget from input CC Data
   */
  unregisterCC: MIDIUnregisterCCCallback

  /**
   * Unregisters this widget from input Note Data
   */
  unregisterNote: MIDIUnregisterNoteCallback
}

export function ChildLayout({ childWidgets, callbacks, aux }: { childWidgets: Widget[], callbacks: WidgetCallbacks, aux?: React.ReactElement }) {
    return <>{childWidgets.map((v, i) => <RichLayout key={i} def={v} callbacks={callbacks} aux={aux} />)}</>
}

export function RichLayout({ def, callbacks, aux }: { def: Widget, callbacks: WidgetCallbacks, aux?: ReactElement }) {
  return <>
    {aux ? (<form onSubmit={(ev) => {
      ev.preventDefault();
      callbacks.sendUiEvent(def)
    }}>
      {aux}
    </form>) : ""}
      <SingleLayout def={def} callbacks={callbacks} />
  </>
}

const stringToElement = (d, k, c, a) => {
  switch (d.type) {
    case 'notebutton':
      return <NoteButton def={d} key={k} callbacks={c} />
    case 'ccslider':
      return <CCSlider def={d} key={k} callbacks={c} />
    case 'horiz-mixer':
      return <Horizontal def={d} key={k} callbacks={c} aux={a} />
    case 'vert-mixer':
      return <Vertical def={d} key={k} callbacks={c} aux={a} />
    case 'grid-mixer':
      return <Grid def={d} key={k} callbacks={c} aux={a} />
    case 'ccbutton':
      return <CCButton def={d} key={k} callbacks={c} />
    case 'rotary':
      return <Rotary def={d} key={k} callbacks={c} />
    case 'xypad':
      return <XYPad def={d} key={k} callbacks={c} />
    case 'shift':
      return <ShiftArea def={d} key={k} callbacks={c} />
    case 'jogwheel':
      return <Jogwheel def={d} key={k} callbacks={c} />
    case 'tab':
      return <TabbedArea def={d} key={k} callbacks={c} />
    case 'empty':
    default:
      return <div className="empty"></div>
  };

}
export function SingleLayout({ def, callbacks, aux }: { def: Widget, callbacks: WidgetCallbacks, aux?: ReactElement }) {

  return <>
    {stringToElement(def, 0, callbacks, aux)}
  </>
}

export function Layout({ children, callbacks, aux }: { children: Widget[], callbacks: WidgetCallbacks, aux?: React.ReactElement }) {
  return <>
    {children.map((def, k) => 
    {
      //stringToElement(def, k, callbacks, aux)
      switch (def.type) {
        case 'notebutton':
          return <NoteButton def={def} key={k} callbacks={callbacks} />
        case 'ccslider':
          return <CCSlider def={def} key={k} callbacks={callbacks} />
        case 'horiz-mixer':
          return <Horizontal def={def} key={k} callbacks={callbacks} aux={aux} />
        case 'vert-mixer':
          return <Vertical def={def} key={k} callbacks={callbacks} aux={aux} />
        case 'grid-mixer':
          return <Grid def={def} key={k} callbacks={callbacks} aux={aux} />
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
    <div id={o.id} className="overlay" data-overlay="view" style={{
      //width: "calc(100% - 1em)",
      //height: "calc(100% - 1em)",
      width: "100%",
      height: "100%",
      display: "flex",
      gap: "1em",
      justifyContent: "center",
      ...style ?? {}
    }}>
      <Layout children={o.cells} callbacks={callbacks} aux={<></>}/>
    </div>
  )
}