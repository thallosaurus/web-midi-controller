class Logger {
    static _logger: Logger
        
    constructor(public tag: string) {}

    debug(msg: string) {
        console.debug(this.tag, msg);
    }
    warn(msg: string) {
        console.warn(this.tag, msg);
    }
    error(msg: string) {
        console.error(this.tag, msg)
    }
    log(msg: string) {
        console.log(this.tag, msg)
    }
}
