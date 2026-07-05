import { Overlay, Widget } from "@hdj/definitions";
import { Button } from "./Button";
import { Slider } from "./Slider";
import { Grid, Horizontal, ShiftArea, TabbedArea, Vertical } from "./Layout";
import { Rotary } from "./Rotary";
import { XYPad } from "./XYPad";
import { Jogwheel } from "./Jogwheel";
import { WCallbacks, WidgetActionContext } from "./Callbacks";

const stringToElement = (d: Widget) => {
  switch (d.type) {
    case 'ccbutton':
    case 'notebutton':
      return <Button def={d} />
    case 'ccslider':
      return <Slider def={d} />
    case 'horiz-mixer':
      return <Horizontal def={d}>
        <SingleWidget children={d.horiz} />
      </Horizontal>
    case 'vert-mixer':
      return <Vertical def={d}>
        <SingleWidget children={d.vert} />
      </Vertical>
    case 'grid-mixer':
      return <Grid def={d}>
        <SingleWidget children={d.grid} />
      </Grid>
    case 'rotary':
      return <Rotary def={d} />
    case 'xypad':
      return <XYPad def={d} />
    case 'shift':
      return <ShiftArea def={d}>
        <SingleWidget children={d.a} />
        <SingleWidget children={d.b} />
      </ShiftArea>
    case 'jogwheel':
      return <Jogwheel def={d} />
    case 'tab':
      return <TabbedArea def={d}>
        <SingleWidget children={d.tabs} />
      </TabbedArea>
    case 'empty':
    default:
      return <div className="empty"></div>
  };

}
/* export function SingleLayout({ def }: { def: Widget }) {

  return <>
    {stringToElement(def, uuid())}
  </>
} */

export function WidgetCell({ def }: { def: Widget }) {
  return <>
    {stringToElement(def)}
  </>
}

export function SingleWidget({ children }: { children: Widget[] }) {
  return <>
    {children.map((def, key) => {
      const k = `${key}-${def.type}-${def.id}`;
      <WidgetCell def={def} key={k} />
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
        //width: "calc(100% - 1em)",
        //height: "calc(100% - 1em)",
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