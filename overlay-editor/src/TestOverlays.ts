import { CCSliderProperties, Overlay, Widget } from "@hdj/definitions"

const TestOscWidget: Widget & CCSliderProperties = {
  output: "osc",
  address: "/test",
  label: "osc-test",
  mode: "absolute",
  type: "ccslider",
  id: null,
  vertical: false,
  cc: 3,
  value: 0,
  value_off: 0,
  default_value: 0
}

export const TestOscOverlay: Overlay = {
  id: "test_osc",
  name: "OSC Test Overlay",
  channel: null,
  program: null,
  cells: [TestOscWidget]
}


export const MATRIX_OVERLAY: Overlay = {
  "id": "note-midi-grid",
  "name": "8x8 MIDI Grid",
  "channel": null,
  "program": null,
  "cells": [
    {
      "id": null,
      "h": 8,
      "type": "grid-mixer",
      "w": 8,
      "grid": [
        {
          "channel": 1,
          "id": null,
          "label": null,
          "output": "midi",
          "mode": "trigger",
          "note": 0,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 1,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 2,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 3,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 4,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 5,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 6,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 16,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 17,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 18,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 19,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 20,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 21,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 22,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 23,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 24,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 32,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 33,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 34,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 35,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 36,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 37,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 38,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 39,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 48,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 49,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 50,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 51,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 52,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 53,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 54,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 55,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 64,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 65,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 66,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 67,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 68,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 69,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 70,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 71,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 80,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 81,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 82,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 83,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 84,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 85,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 86,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 87,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 96,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 97,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 98,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 99,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 100,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 101,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 102,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 103,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 112,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 113,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 114,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 115,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 116,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 117,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 118,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "id": null,
          "label": null,
          "mode": "trigger",
          "note": 119,
          "type": "notebutton"
        }
      ]
    }
  ]
};