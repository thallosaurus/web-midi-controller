import { CCProperties, midi, NoteProperties, osc, Overlay, Widget } from "@hdj/definitions"
import { CCButton, NoteButton } from "./Button.tsx";
import { CCSlider } from "./Slider.tsx";
import { Grid, Horizontal, ShiftArea, TabbedArea, Vertical } from "./Layout.tsx";
import { Rotary } from "./Rotary.tsx";
import { XYPad } from "./XYPad.tsx";
import { Jogwheel } from "./Jogwheel.tsx";
import { ReactElement } from "react";
import { useWidgetAction, WCallbacks, WidgetActionContext } from "./Callbacks.tsx";

/*export function ChildLayout({ childWidgets, aux }: { childWidgets: Widget[], aux?: React.ReactElement }) {
  return <>{childWidgets.map((v, i) => <RichLayout key={i} def={v} aux={aux} />)}</>
}

export function RichLayout({ def, aux }: { def: Widget, aux?: ReactElement }) {
  const callbacks = useWidgetAction();
  return <>
    {aux ? (<form onSubmit={(ev) => {
      ev.preventDefault();
      //callbacks.sendUiEvent(def)
    }}>
      {aux}
    </form>) : ""}
    <SingleLayout def={def} />
  </>
}*/

const stringToElement = (d, k, a) => {
  switch (d.type) {
    case 'notebutton':
      return <NoteButton def={d} key={k} />
    case 'ccslider':
      return <CCSlider def={d} key={k} />
    case 'horiz-mixer':
      return <Horizontal def={d} key={k} aux={a} />
    case 'vert-mixer':
      return <Vertical def={d} key={k} aux={a} />
    case 'grid-mixer':
      return <Grid def={d} key={k} aux={a} />
    case 'ccbutton':
      return <CCButton def={d} key={k} />
    case 'rotary':
      return <Rotary def={d} key={k} />
    case 'xypad':
      return <XYPad def={d} key={k} />
    case 'shift':
      return <ShiftArea def={d} key={k} />
    case 'jogwheel':
      return <Jogwheel def={d} key={k} />
    case 'tab':
      return <TabbedArea def={d} key={k} />
    case 'empty':
    default:
      return <div className="empty"></div>
  };

}
export function SingleLayout({ def, aux }: { def: Widget, aux?: ReactElement }) {

  return <>
    {stringToElement(def, 0, aux)}
  </>
}

export function Layout({ children, aux }: { children: Widget[], aux?: React.ReactElement }) {
  return <>
    {children.map((def, k) => {
      //stringToElement(def, k, callbacks, aux)
      switch (def.type) {
        case 'notebutton':
          return <NoteButton def={def} key={k} />
        case 'ccslider':
          return <CCSlider def={def} key={k} />
        case 'horiz-mixer':
          return <Horizontal def={def} key={k} aux={aux} />
        case 'vert-mixer':
          return <Vertical def={def} key={k} aux={aux} />
        case 'grid-mixer':
          return <Grid def={def} key={k} aux={aux} />
        case 'ccbutton':
          return <CCButton def={def} key={k} />
        case 'rotary':
          return <Rotary def={def} key={k} />
        case 'xypad':
          return <XYPad def={def} key={k} />
        case 'shift':
          return <ShiftArea def={def} key={k} />
        case 'jogwheel':
          return <Jogwheel def={def} key={k} />
        case 'tab':
          return <TabbedArea def={def} key={k} />
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

export interface WidgetProperties<T> {
  def: T,
  //callbacks: WidgetCallbacks,
}

export function OverlayView({ o, callbacks, style }: { o: Overlay, callbacks: WCallbacks, style?: React.CSSProperties }) {
  return (
    <WidgetActionContext value={callbacks}>
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
        <Layout children={o.cells} aux={<></>} />
      </div>
    </WidgetActionContext>
  )
}