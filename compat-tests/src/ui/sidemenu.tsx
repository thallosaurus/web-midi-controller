import { FC, useState } from "react"

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
            onClick={() => setExpanded(!expanded)}>{ label }</button>
            <div className="content" style={{
                display: expanded ? "block" : "none",
                padding: "1em 0",
                borderBottom: "5px solid #666666",
                margin: "0 0 1em 0"
            }}>{children}</div>
        </div>
    )
}