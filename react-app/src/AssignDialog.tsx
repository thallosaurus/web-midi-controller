import { CSSProperties, ReactNode, useLayoutEffect, useRef, useState } from "react";
import { useWebsocketContext } from "./Contexts";
import { LookupResult } from "@hdj/widgets";
import { AllowedPayloads, WebsocketClient } from "@hdj/homebrewdj-web-client";

function entryToHtml(res: { type: "cc" | "note", sub: number }, i: number, ch: number, ws: WebsocketClient<AllowedPayloads>) {
    return <li key={"entry" + i + "channel" + ch}>
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            margin: "1em 0",
            backgroundColor: "#232323"
        }}>
            <p>{res.type.toUpperCase()}: <span>{res.sub}</span>
            </p>
            <button style={buttonStyle} onClick={() => {
                switch (res.type) {
                    case "cc":
                        ws.send({
                            "type": "cc",
                            "channel": ch,
                            "cc": res.sub,
                            "value": 64
                        });
                        return;

                    case "note":
                        ws.send({
                            "type": "note",
                            "channel": ch,
                            "note": res.sub,
                            "velocity": 64
                        })
                        return
                }
            }}>Assign</button>
        </div>
    </li>
}

function resultsToHtml(result: LookupResult, ws: WebsocketClient<AllowedPayloads>) {
    const r: ReactNode[] = [];
    result.midi.forEach((v, ch) => {
        const html = <ul style={{
            listStyleType: "none",
            marginBlockStart: 0,
            marginBlockEnd: 0,
            paddingInlineStart: 0
        }} key={"channel" + ch}>
            <span style={{
                "fontSize": "2em",
                display: "block",
                width: "100%",
                borderBottom: "1px solid black"
            }}>Channel <span style={{
                borderBottom: "1px solid white"
            }}>{ch}</span>
            </span>
            {v.map((res, i) => {
                return entryToHtml(res, i, ch, ws)
            })}
        </ul>
        r.push(html);
    })
    return (
        <>{r}</>
    )
}

const buttonStyle = {
    padding: ".7em",
    fontFamily: "monospace",
    color: "black",
    backgroundColor: "white",
    border: "none",
    fontSize: "1.2em"
} as React.CSSProperties;

const fix = {
    width: "80%",
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    margin: 0,
} as CSSProperties;

export function AssignDialog({ showModal, closeDialog }: { showModal: boolean, closeDialog: () => void }) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const ws = useWebsocketContext();
    const [results, setLookupResults] = useState<LookupResult | null>(null)

    useLayoutEffect(() => {
        if (dialogRef.current?.open && !showModal) {
            dialogRef.current.close()
        } else if (!dialogRef.current?.open && showModal) {
            dialogRef.current?.showModal();
            const r = ws.bus.lookup();
            setLookupResults(r)
            console.log(r);
        }
    }, [showModal])

    return (
        <dialog ref={dialogRef} onClose={closeDialog} style={{
            //   width: "80%",
            border: "none",
            color: "white",
            backgroundColor: "#131313",
            ...fix
        }}>
            <div style={{
                padding: "1em 0",
            }}>
                <p style={{
                    fontSize: "2em",
                    margin: "0 0 1em 0"
                }}>Assign Widgets</p>
                {results && resultsToHtml(results, ws.ws)}
            </div>
            <button onClick={closeDialog} type="button" style={buttonStyle}>Close</button>
        </dialog>
    )
}