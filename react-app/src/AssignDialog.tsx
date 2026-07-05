import { ReactNode, useLayoutEffect, useRef, useState } from "react";
import { useWebsocketContext } from "./Contexts";
import { LookupResult } from "@hdj/widgets";
import { AllowedPayloads, WebsocketClient } from "@hdj/homebrewdj-web-client";

function entryToHtml(res: { type: "cc" | "note", sub: number }, i: number, ch: number, ws: WebsocketClient<AllowedPayloads>) {
    return <li key={"entry" + i + "channel" + ch}>
        <p>{res.type}: {res.sub}</p>
        <button onClick={() => {
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
            }
        }}>Assign</button>
    </li>
}

function resultsToHtml(result: LookupResult, ws: WebsocketClient<AllowedPayloads>) {
    const r: ReactNode[] = [];
    result.midi.forEach((v, ch) => {
        const html = <ul key={"channel" + ch}>
            <span style={{
                "fontSize": "2em"
            }}>Channel {ch}</span>
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
        }}>
            {results && resultsToHtml(results, ws.ws)}
            <button onClick={closeDialog} type="button">Close</button>
        </dialog>
    )
}