import { Overlay, Widget } from "@hdj/definitions";
import { Button } from "./Button";
import { Slider } from "./Slider";
import { Grid, Horizontal, ShiftArea, TabbedArea, Vertical } from "./Layout";
import { Rotary } from "./Rotary";
import { XYPad } from "./XYPad";
import { Jogwheel } from "./Jogwheel";
import { WCallbacks, WidgetActionContext } from "./Callbacks";

const stringToElement = (d: Widget, k: string) => {
  console.log(d);
  switch (d.type) {
    case 'ccbutton':
    case 'notebutton':
      return <Button def={d} key={k} />
    case 'ccslider':
      return <Slider def={d} key={k} />
    case 'horiz-mixer':
      return <Horizontal def={d} key={k}>
        <SingleWidget children={d.horiz} />
      </Horizontal>
    case 'vert-mixer':
      return <Vertical def={d} key={k}>
        <SingleWidget children={d.vert} />
      </Vertical>
    case 'grid-mixer':
      return <Grid def={d} key={k}>
        <SingleWidget children={d.grid} />
      </Grid>
    case 'rotary':
      return <Rotary def={d} key={k} />
    case 'xypad':
      return <XYPad def={d} key={k} />
    case 'shift':
      return <ShiftArea def={d} key={k}>
        <SingleWidget children={d.a} />
        <SingleWidget children={d.b} />
      </ShiftArea>
    case 'jogwheel':
      return <Jogwheel def={d} key={k} />
    case 'tab':
      return <TabbedArea def={d} key={k}>
        <SingleWidget children={d.tabs} />
      </TabbedArea>
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

export function WidgetCell({ def, k }: { def: Widget, k?: string }) {
  return <>
    {stringToElement(def, k ?? "")}
  </>
}

export function SingleWidget({ children }: { children: Widget[] }) {
  return <>
    {children.map((def, key) => {
      const k = `${key}-${def.type}-${def.id}`;
      return <WidgetCell def={def} k={k} />
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
      <style>{o.style ?? ""}</style>
      <div id={o.id} className="overlay" data-overlay="view" style={{
        width: "100%",
        height: "100%",
        display: "flex",
        gap: "1em",
        justifyContent: "center",
        ...style ?? {}
      }}>
        <SingleWidget children={o.cells} />
      </div>
    </WidgetActionContext>
  )
}