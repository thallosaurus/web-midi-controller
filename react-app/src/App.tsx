import { parseOverlay, RegisterCCCallback, RegisterNoteCallback, SendCCCallback, SendNoteCallback, UnregisterCCCallback, UnregisterNoteCallback, WidgetCallbacks } from "widgets";
import type { Overlay } from "widget-definitions";
import { AllowedPayloads, CCMessagePayload, NoteMessagePayload, WebsocketClient } from "homebrewdj-web-client";
import { useEffect, useRef } from "react";
import { uuid } from "./utils";
import { EventBus } from "./EventBus";

const XYPAD = {
  "id": "fullscreen-xy-pad",
  "name": "Fullscreen XY Pad",
  "program": 0,
  "cells": [
    {
      "type": "vert-mixer",
      "vert": [
        {
          "channel": 2,
          "label": "XY Pad",
          "type": "xypad",
          "x": {
            "cc": 4
          },
          "y": {
            "cc": 5
          }
        }
      ]
    }
  ]
}

const OVERLAY: Overlay = {
  name: "Volume Sliders",
  channel: null,
  program: null,
  id: null,
  cells: [{
    type: "horiz-mixer",
    id: null,
    horiz: [{
      "type": "ccslider",
      "cc": 1,
      "channel": 1,
      "label": "Deck A",
      "mode": "absolute",
      "vertical": false,
      "value": 0,
      "value_off": 0,
      "id": null,
      "default_value": 0
    },
    {
      "type": "ccslider",
      "cc": 1,
      "channel": 2,
      "label": "Deck B",
      "mode": "absolute",
      "vertical": false,
      "value": 0,
      "value_off": 0,
      "id": null,
      "default_value": 0
    }]
  }]
};

function App() {
  const client = useRef<WebsocketClient<AllowedPayloads> | null>(null);
  //const ccCallbackMap = useRef<CallbackMap>(new Map())
  //const noteCallbackMap = useRef<CallbackMap>(new Map())
  const eventbus = useRef<EventBus>(new EventBus());

  useEffect(() => {

    const process = (msg: any) => {
      if (eventbus.current) {
        switch (msg.type) {
          case "cc":
            eventbus.current.processCC(msg);
            break
          case "note":
            eventbus.current.processNote(msg);
            break;
        }
      }
    }

    const url = new URL("/ws", location.href);
    url.protocol = "ws";
    const wsClient = new WebsocketClient<CCMessagePayload | NoteMessagePayload>(url, process);
    client.current = wsClient;
    eventbus.current.setSender(wsClient);
  })

  return (
    <>
      {parseOverlay(OVERLAY, eventbus.current!)}
    </>
  )
}

export default App;
