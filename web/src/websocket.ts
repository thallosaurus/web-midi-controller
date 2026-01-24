const wsUri = "ws://" + location.hostname + ":8080";
const ws = new WebSocket(wsUri);
ws.onopen = () => {
    console.log("connection")
}
ws.onmessage = (e) => {
    console.log(e);
}

export default ws;