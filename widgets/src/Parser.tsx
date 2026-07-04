import { Overlay, Widget } from "@hdj/definitions";
import { Button } from "./Button";
import { CCSlider } from "./Slider";
import { Grid, Horizontal, ShiftArea, TabbedArea, Vertical } from "./Layout";
import { Rotary } from "./Rotary";
import { XYPad } from "./XYPad";
import { Jogwheel } from "./Jogwheel";
import { WCallbacks, WidgetActionContext } from "./Callbacks";

const stringToElement = (d, k) => {
  switch (d.type) {
    case 'ccbutton':
    case 'notebutton':
      return <Button def={d} key={k} />
    case 'ccslider':
      return <CCSlider def={d} key={k} />
    case 'horiz-mixer':
      return <Horizontal def={d} key={k} />
    case 'vert-mixer':
      return <Vertical def={d} key={k} />
    case 'grid-mixer':
      return <Grid def={d} key={k} />
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
      return <div className="empty" key={k}></div>
  };

}
/* export function SingleLayout({ def }: { def: Widget }) {

  return <>
    {stringToElement(def, uuid())}
  </>
} */

export function Layout({ children }: { children: Widget[], aux?: React.ReactElement }) {
  return <>
    {children.map((def, k) => {
      const key = `${k}-${def.type}-${def.id}`
      return stringToElement(def, key)
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
      <style>{o.style??""}</style>
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
        <Layout children={o.cells} />
      </div>
    </WidgetActionContext>
  )
}