import { CSSProperties, useRef, useState } from "react";
import { useWebsocketContext } from "./Contexts";
import { getEndpointUrl } from "./utils";

const buttonStyle: CSSProperties = {
  padding: "1em",
  fontFamily: "monospace",
  border: "none",
  backgroundColor: "white",
  display: "block",
  width: "100%",
  fontWeight: "bold"
}

export function ConnectScreen() {
  const ws = useWebsocketContext();
  const [url, setUrl] = useState(getEndpointUrl().host);

  return <div style={{
    display: "flex",
    width: "100%",
    height: "100%",
    justifyContent: "space-around"
  }}>
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-around"
    }}>
      <form>
        <h2>Connect to Address</h2>
        <label htmlFor="urlInput">Hostname</label>
        <input name="urlInput" value={url} onChange={(ev) => setUrl(ev.target.value)} style={{
          ...buttonStyle,
          fontSize: "1.5em",
          color: "white",
          borderBottom: ".2em solid grey",
          padding: ".5em 0",
          margin: ".5em 0",
          backgroundColor: "black",
        }} type="text" />
        <button style={buttonStyle} onClick={async (ev) => {
          ev.preventDefault();
          const u = new URL("/ws", "ws://" + url);
          u.protocol = "ws";
          await ws.connect(u)
          console.log("after connect")
        }}>Connect</button>
      </form>
    </div>
  </div>
}