## Server Components
The server contains multiple modules:
- Main: Responsible for reacting to state changes and distributing the updates to the clients and midi driver
- WebsocketHandler: responsible for taking the input from websocket clients and triggers the state changes
- State: Holds stuff like current Program Change Id. Triggers an event on update
- MIDI Driver: Takes part in the state updates and controls the software

### Diagram
- Main
    - clients: Array<ws_handler>
    - midi driver
    - state