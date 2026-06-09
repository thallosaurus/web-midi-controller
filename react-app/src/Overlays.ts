import { HorizontalMixerProperties, Overlay, VerticalMixerProperties, Widget } from "@hdj/definitions";

const deckA: Widget & VerticalMixerProperties = {
  id: "deck_a",
  type: "vert-mixer",
  vert: [{
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
  }, {
    "type": "notebutton",
    "mode": "latch",
    "id": "mixercue_decka",
    "label": "Mixer Cue",
    "channel": 1,
    "note": 33
  }]
}

const deckB: Widget & VerticalMixerProperties = {
  id: "deck_b",
  type: "vert-mixer",
  vert: [{
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
  }, {
    "type": "notebutton",
    "mode": "latch",
    "id": "mixercue_decka",
    "label": "Mixer Cue",
    "channel": 2,
    "note": 33
  }]
}

export const VOLUME_SLIDER_OVERLAY_NEW: Overlay = {
  name: "Volume Sliders",
  channel: null,
  program: null,
  id: null,
  cells: [deckA, deckB]
}

export const VOLUME_SLIDER_OVERLAY: Overlay = {
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

export const XYPAD_OVERLAY = {
  "id": "fullscreen-xy-pad",
  "name": "Fullscreen XY Pad",
  "program": 0,
  "channel": null,
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