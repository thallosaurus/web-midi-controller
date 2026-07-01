import { FC } from "react";

export const ConnectView: FC<{ connect: () => void, openSynth: () => void }> = ({ connect, openSynth }) => {
  return (
    <div style={{
      height: "100%",
      width: "100%",
      display: "flex",
      justifyContent: "space-around",
    }}>
      <div style={{
        width: "50%",
        height: "auto",
        flexDirection: "column",
      }}>
        <h2>Connect to Server</h2>
        <p>Connect to the Server running this application</p>
        <button style={{
          height: "4em",
          width: "100%",
          fontFamily: "monospace",
          fontWeight: "bold"
        }} onClick={async () => {
          connect()
        }}>Connect</button>

        <h2>Local Synthesizer</h2>
        <p>Experimental Synthesizer based on WebAudio</p>
        <button style={{
          height: "4em",
          width: "100%",
          fontFamily: "monospace",
          fontWeight: "bold"
        }} onClick={() => {
          openSynth();
        }}>WebAudio Synthesizer</button>
      </div>
    </div>
  )
}