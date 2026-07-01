import { Overlay, Widget } from "@hdj/definitions"
import { CCButton, NoteButton } from "./Button.tsx";
import { CCSlider } from "./Slider.tsx";
import { Grid, Horizontal, ShiftArea, TabbedArea, Vertical } from "./Layout.tsx";
import { Rotary } from "./Rotary.tsx";
import { XYPad } from "./XYPad.tsx";
import { Jogwheel } from "./Jogwheel.tsx";

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

export type WidgetCallbacks = MIDIWidgetCallbacks & OSCWidgetCallbacks;

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
      <Layout children={o.cells} callbacks={callbacks} />
    </div>
  )
}