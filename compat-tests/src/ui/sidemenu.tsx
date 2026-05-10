import { createContext, FC, useContext, useState } from "react"
import { OverlayList } from "./overlay";
import { useWebsocket } from "../websocket/client";
import { WidgetLifecycle } from "midi-controller";

const MenuContext = createContext(null);
export function MenuProvider({children}) {
    const [menuShown, setMenuShown] = useState<boolean>(false);

    return (
        <MenuContext.Provider value={{
            menuShown,
            setMenuShown
        }}>{children}</MenuContext.Provider>
    )
}

export function useMenuContext() {
    const ctx = useContext(MenuContext);

    if (!ctx) {
        throw new Error("useMenuContext must be used inside MenuProvider");
    }

    return ctx
}

export const AppSidemenu: FC<{ showMenu: boolean }> = ({ showMenu }) => {
    const { ws, connected } = useWebsocket();
    return (
        <div id="sidemenu" className={showMenu ? "sidemenu-shown" : "sidemenu-hidden"}>

            <Sidemenu>
                <SidemenuChildren label="Overlays">
                    <OverlayList></OverlayList>
                </SidemenuChildren>
                <SidemenuChildren label="Connection">
                    <p>
                        <span>{connected ? "Connected" : "Disconnected"}</span>
                    </p>
                    <button type="button" style={{
                        backgroundColor: "#333333",
                        border: "none",
                        color: "white",
                        width: "100%",
                        padding: "1em",
                        fontFamily: "monospace"
                    }} onClick={() => {
                        ws.disconnectEndpoint();
                    }}>Disconnect</button>
                </SidemenuChildren>
                <SidemenuChildren label="Debug">
                    <p>
                        <span>Connected</span>
                    </p>
                    <button style={{
                        backgroundColor: "#333333",
                        border: "none",
                        color: "white",
                        width: "100%",
                        padding: "1em",
                        fontFamily: "monospace"
                    }} onClick={() => {
                        WidgetLifecycle.setEditMode(true)
                    }}>Trigger Edit</button>
                </SidemenuChildren>
            </Sidemenu>
        </div>
    )
}

export const Sidemenu = ({ children }) => {
    return (<ul className="sidemenu" style={{
        listStyleType: "none",
        marginBlockStart: "0",
        marginBlockEnd: "0",
        paddingInlineStart: "0",
        width: "100%",
        height: "calc(100% - 2em"
    }}>
        <li className="sidemenu-children">
            {children}
        </li>
    </ul>)
}

export const SidemenuChildren: FC<{ children: any, label: string }> = ({ label, children }) => {
    const [expanded, setExpanded] = useState<boolean>(false);
    return (
        <div className="sidemenu-children-container">
            <button style={{
                backgroundColor: "#333333",
                border: "none",
                color: "white",
                width: "100%",
                padding: "1em",
                fontWeight: expanded ? "bold" : "normal",
                fontFamily: "monospace"
            }}
                onClick={() => setExpanded(!expanded)}>{label}</button>
            <div className="content" style={{
                display: expanded ? "block" : "none",
                padding: "1em 0",
                borderBottom: "5px solid #666666",
                margin: "0 0 1em 0"
            }}>{children}</div>
        </div>
    )
}