import { createContext, useRef, useState, useContext } from "react";
import { Overlay } from "../../bindings/Overlay";
import { Sidemenu } from "./sidemenu";

export const OverlayList = () => {
    const {
        overlays,
        setSelectedOverlay,
        selectedOverlay
    } = useOverlays();
    return (<>
        {
            overlays.current.map((v, i) => {
                return (
                    <button style={{
                        backgroundColor: selectedOverlay == i ? "#eeeeee" : "white",
                        color: "black",
                        width: "100%",
                        padding: "1em",
                        fontFamily: "monospace",
                        fontWeight: selectedOverlay == i ? "bold" : "normal",
                        border: "none"
                    }}
                        onClick={() => {
                            console.log(i);
                            setSelectedOverlay(i)
                        }} key={i} disabled={selectedOverlay == i}>{v.name}</button>
                )
            })
        }</>)
}

export const OverlaySelector = () => {
    const {
        overlays,
        setSelectedOverlay
    } = useOverlays();

    return (
        <select onChange={(e) => {
            console.log(e.target.value);
            setSelectedOverlay(Number(e.target.value));
        }}>
            {overlays.current.map((v, i) => {
                return (
                    <option key={i} value={i}>{v.name}</option>
                )
            })}
        </select>
    )
}
const OverlayContext = createContext(null);
export function OverlayProvider({ children }) {
    const overlayRef = useRef<Overlay[]>([]);

    //const [overlays, setOverlays] = useState<Overlay[]>([]);
    const [selectedOverlay, setSelectedOverlay] = useState<number>(-1);

    const fetchOverlays = async (path: string) => {
        console.log("fetch", path);
        const data = await fetch(path);
        overlayRef.current = await data.json();
        setSelectedOverlay(0)
        /*.then(ol => load_overlays_from_array(ol))
        .then((ol) => {
            setup_overlay_selector(ol);
            change_overlay(0)
        })*/
    }

    const unloadOverlays = () => {
        overlayRef.current = [];
        setSelectedOverlay(-1);
    }

    /*unload() {
      
    }*/

    return (
        <OverlayContext.Provider value={{
            overlays: overlayRef,
            selectedOverlay,
            setSelectedOverlay,
            fetchOverlays,
            unloadOverlays
        }}>
            {children}
        </OverlayContext.Provider>
    )
}

export function useOverlays() {
    const ctx = useContext(OverlayContext);

    if (!ctx) {
        throw new Error("useOverlays must be used inside OverlayProvider");
    }

    return ctx;
}