import { TypedEventTarget, defineTypedEvent, defineTypedCustomEvent } from 'typed-event-target';
// events that the app sends out

export class AppEvents extends TypedEventTarget<InitDone | ConnectionStatusChanged> {}

export class InitDone extends defineTypedEvent("example-event") {}
export class ConnectionStatusChanged extends defineTypedCustomEvent<boolean>()("connection-status-changed") {
    //connected: boolean
}