export type CoreWorkerMessage = { type: "terminate" }

/**
 * The worker side of the worker. gets instantiated in the called script
 */
export abstract class CoreWorker<Msg> {
    gthis: typeof globalThis
    constructor(s: typeof globalThis) {
        this.gthis = s;
        s.addEventListener("message", (msg) => {
            switch(msg.data.type) {
                case "terminate":
                    console.log("terminating worker");
                    break;
                default:
                    this.processWorkerInputMessage.bind(this)(msg.data);
            }
        });
    }

    send(msg: Msg) {
        this.gthis.postMessage(msg);
    }

    abstract processWorkerInputMessage(e: Msg): void
}

export abstract class CoreWorkerClient<Msg> {
    worker: Worker
    constructor(url: URL) {
        this.worker = new Worker(url, { type: "module" });
    }
    send(msg: Msg) {
        this.worker.postMessage(msg);
    }
}

// return new Worker Client (coming later)
/*function spawnNewWorker<T extends CoreWorkerMessage>(url: URL): CoreWorkerClient<T> {
    //return new CoreWorkerClient(url);
}*/