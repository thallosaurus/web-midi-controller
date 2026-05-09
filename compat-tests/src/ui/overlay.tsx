import { createContext, useRef, useState, useContext } from "react";
import { Overlay } from "../../bindings/Overlay";

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
            {overlays.map((v, i) => {
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
    const [selectedOverlay, setSelectedOverlay] = useState<number | null>(null);

    const fetchOverlays = async (path: string) => {
        console.log("fetch", path);
        const data = await fetch(path);
        overlayRef.current = await data.json();
        /*.then(ol => load_overlays_from_array(ol))
        .then((ol) => {
            setup_overlay_selector(ol);
            change_overlay(0)
        })*/
    }

    const unloadOverlays = () => {
        overlayRef.current = [];
        setSelectedOverlay(null);
    }

    /*unload() {
      
    }*/

    return (
        <OverlayContext.Provider value={{
            overlays: overlayRef.current,
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