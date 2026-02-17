export type CoreWorkerMessage = { type: "terminate" }

/**
 * The worker side of the worker. gets instantiated in the called script
 */
export abstract class CoreWorker<InMsg, OutMsg> {
    //gthis: typeof globalThis
    constructor() {
        //this.gthis = s;
        self.addEventListener("message", (msg) => {
            switch (msg.data.type) {
                case "terminate":
                    console.log("terminating worker");
                    self.close();
                    break;
                default:
                    this.processWorkerInputMessage(msg.data);
            }
        });
    }

    send(msg: OutMsg) {
        self.postMessage(msg);
    }

    abstract processWorkerInputMessage(e: InMsg): void
}

export abstract class CoreWorkerClient<InMsg, OutMsg> {
    worker: Worker
    constructor(worker: Worker) {
        //this.worker = new Worker(url, { type: "module" });
        this.worker = worker;
        this.worker.addEventListener("message", (ev) => {
            switch (ev.data.type) {
                case "terminate":
                    // worker sent "terminate" - UB for now
                    break;
                default:
                    this.processWorkerClientMessage(ev.data);
                    break;
            }
        })
    }
    send(msg: OutMsg) {
        this.worker.postMessage(msg);
    }

    abstract processWorkerClientMessage(msg: InMsg): void;

    terminate() {
        this.send({
            type: "terminate",
        } as any)
    }
}

// return new Worker Client (coming later)
/*function spawnNewWorker<T extends CoreWorkerMessage>(url: URL): CoreWorkerClient<T> {
    //return new CoreWorkerClient(url);
}*/