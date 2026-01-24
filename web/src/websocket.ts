const wsUri = "ws://" + location.hostname + ":8080";
const ws = new WebSocket(wsUri);
ws.onopen = () => {
    console.log("connection")
    document.querySelector<HTMLDivElement>("#connection_status")!.innerText = "connected";
}
ws.onmessage = (e) => {
    console.log(e);
}
ws.onclose = () => {
    document.querySelector<HTMLDivElement>("#connection_status")!.innerText = "disconnected";
}

export default ws;