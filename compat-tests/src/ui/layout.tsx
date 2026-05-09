import { GridMixerProperties, HorizontalMixerProperties, ShiftAreaProperties, VerticalMixerProperties } from "../../bindings/Widget.ts";


//import './css/shiftarea.css';
import './layout.css';
import { EventBusConsumer } from "../eventbus/client.tsx";
import { FC } from "react";
import { renderWidgetReact } from "./render.tsx";
//import { App } from "../../app";

// MARK: - React Extensions
export const HorizontalBoxReact: FC<{ p: HorizontalMixerProperties }> = ({ p }) => {

    //if (p.id) 
    return (
        <div className="widget horiz-mixer">
            {p.horiz.map((v, i) => {
                return (<>
                    {renderWidgetReact(v)}
                </>)
            })}
        </div>
    )
}

export const VerticalBoxReact: FC<{ p: VerticalMixerProperties }> = ({ p }) => {

    //if (p.id) 
    return (
        <div className="widget vert-mixer">
            {p.vert.map((v, i) => {
                return (
                    <>
                        {renderWidgetReact(v)}
                    </>)
            })}
        </div>
    )
}

export const EmptyBox: FC = () => {
    return (
        <div></div>
    )
}

export const GridMixerReact: FC<{ p: GridMixerProperties }> = ({ p }) => {
    return (<div className="widget grid-mixer" style={{
        "--cols": p.w,
        "--rows": p.h
    } as React.CSSProperties}>
        {p.grid.map((v, i) => {
            return (
                <>
                    {renderWidgetReact(v)}
                </>
            )
        })}
    </div>);
}