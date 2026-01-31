enum LogLevel {
    Debug,
    Warn,
    Error,
    Info,
    Log
}

let tag: string | null = null
export function setup_logger(name: string) {
    if (!tag) tag = name;
}
function output(level: LogLevel, ...msg: any) {
    if (!tag) throw new Error("no logger setup")
    switch (level) {
        case LogLevel.Debug:
            console.debug(tag, ...msg);
            break;
        case LogLevel.Warn:
            console.warn(tag, ...msg);
            break
        case LogLevel.Error:
            console.error(tag, ...msg);
            break;
        case LogLevel.Info:
            console.info(tag, ...msg);
            break;
        case LogLevel.Log:
            console.log(tag, ...msg);
            break;
    }
}
export function debug(...msg: unknown[]) {

    output(LogLevel.Debug, ...msg)
};
export function warn(msg: any) {

    output(LogLevel.Warn, ...msg)
};
export function error(msg: any) {

    output(LogLevel.Error, ...msg)
};
export function info(msg: any) {

    output(LogLevel.Info, ...msg)
};
export function log(msg: any) {

    output(LogLevel.Info, ...msg)
};
//export  warn = { return Logger._logger.debug };
//export const error = Logger._logger.debug;
//export const log = Logger._logger.debug;