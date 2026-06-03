import { parseOverlay, WidgetCallbacks } from "widgets";
import type { Overlay } from "definitions";
import { WebsocketClient } from "homebrewdj-web-client";
import { useEffect, useRef } from "react";
import { uuid } from "./utils";

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

type CallbackMap = Map<number, Map<number, Map<string, (v: number) => void>>>;

function App() {
  const client = useRef<WebsocketClient | null>(null);
  const ccCallbackMap = useRef<CallbackMap>(new Map())
  const noteCallbackMap = useRef<CallbackMap>(new Map())

  const callbacks = useRef<WidgetCallbacks>({
    sendNote: (channel, note, velocity, on) => {
      console.log("note", channel, note, velocity, on);
      if (client.current) client.current.send({
        type: "note",
        channel,
        note,
        velocity,
        on
      })
    },

    sendCC: (channel, cc, value) => {
      console.log("cc", channel, cc, value);
      if (client.current) client.current.send({
        type: "cc",
        channel,
        cc,
        value
      })
    },

    registerCC: (channel, cc, cb) => {

      if (!ccCallbackMap.current.has(channel)) {
        ccCallbackMap.current.set(channel, new Map());
      }
      const channelMap = ccCallbackMap.current.get(channel);

      if (!channelMap?.has(cc)) {
        channelMap?.set(cc, new Map());
      }
      const ccMap = channelMap?.get(cc);
      const id = uuid()
      ccMap?.set(id, cb);

      return id
    },

    registerNote: (channel, note, cb) => {
      if (!noteCallbackMap.current.has(channel)) {
        noteCallbackMap.current.set(channel, new Map());
      }
      const channelMap = noteCallbackMap.current.get(channel);

      if (!channelMap?.has(note)) {
        channelMap?.set(note, new Map())
      }
      const noteMap = channelMap?.get(note);
      const id = uuid()
      noteMap?.set(id, cb);
      return id
    },

    unregisterNote: (channel, note, id) => {
      if (!noteCallbackMap.current.has(channel)) {
        noteCallbackMap.current.set(channel, new Map());
      }
      const channelMap = noteCallbackMap.current.get(channel);

      if (!channelMap?.has(note)) {
        channelMap?.set(note, new Map());
      }

      const noteMap = channelMap?.get(note);
      noteMap?.delete(id);
    },

    unregisterCC: (channel, cc, id) => {
      if (!ccCallbackMap.current.has(channel)) {
        ccCallbackMap.current.set(channel, new Map());
      }
      const channelMap = ccCallbackMap.current.get(channel);

      if (!channelMap?.has(cc)) {
        channelMap?.set(cc, new Map());
      }
      const ccMap = channelMap?.get(cc);
      ccMap?.delete(id);
    }
  });

  useEffect(() => {
    const url = new URL("/ws", location.href);
    url.protocol = "ws";
    client.current = new WebsocketClient(url, (msg) => {
      switch (msg.type) {
        case "cc":
          {
            const c = ccCallbackMap.current.get(msg.channel);
            const cc = c?.get(msg.cc);
            cc?.forEach((cb) => {
              cb(msg.value)
            })
          }
          break
        case "note":
          {
            const c = noteCallbackMap.current.get(msg.channel);
            const cc = c?.get(msg.note)
            cc?.forEach((cb) => {
              cb(msg.velocity)
            })
          }
      }
    });
  })

  return (
    <>
      {parseOverlay(OVERLAY, callbacks.current)}
    </>
  )
}

export default App;
