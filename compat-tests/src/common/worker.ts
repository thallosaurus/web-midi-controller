
// use a union
type ExampleMessageType = TestMessage;

enum ExampleWorkerMessageType {
    Testmessage = "test-message"
}

interface TestMessage {
    type: ExampleWorkerMessageType.Testmessage,
    payload: "hello world"
}

//type AppWorkerHandler = (worker: Worker) => void;
/**
 *
 * class for the app worker client that runs on the caller side
*/
export abstract class AppWorker<MessageType> {
    thread: Worker
    //handlers: Set<AppWorkerHandler>
    constructor(url: URL) {
        this.thread = new Worker(url, { type: 'module'})
        //this.handlers = new Set();
    }

    connectHandler(msgType: MessageType, handler: (msg: MessageType) => void) {
        this.thread.addEventListener("message", (m) => {
            const msg: MessageType = JSON.parse(m.data);
            handler(msg);
        });
    }
}

class ExampleWorker extends AppWorker<ExampleWorkerMessageType> {

}