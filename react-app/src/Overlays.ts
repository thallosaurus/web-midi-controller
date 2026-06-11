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
    "id": "volume_decka",
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
    "id": "volume_deckb",
    "default_value": 0
  }, {
    "type": "notebutton",
    "mode": "latch",
    "id": "mixercue_deckb",
    "label": "Mixer Cue",
    "channel": 2,
    "note": 33
  }]
}

export const VOLUME_SLIDER_OVERLAY_NEW: Overlay = {
  name: "Volume Sliders (New)",
  channel: null,
  program: null,
  id: "volume_slider_overlay_new",
  cells: [deckA, deckB]
}

export const VOLUME_SLIDER_OVERLAY: Overlay = {
  name: "Volume Sliders",
  channel: null,
  program: null,
  id: "volume_slider_overlay",
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

export const MATRIX_OVERLAY = {
  "id": "note-midi-grid",
  "name": "8x8 MIDI Grid",
  "cells": [
    {
      "h": 8,
      "type": "grid-mixer",
      "w": 8,
      "grid": [
        {
          "channel": 1,
          "mode": "trigger",
          "note": 0,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 1,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 2,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 3,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 4,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 5,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 6,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 16,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 17,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 18,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 19,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 20,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 21,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 22,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 23,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 24,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 32,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 33,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 34,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 35,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 36,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 37,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 38,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 39,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 48,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 49,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 50,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 51,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 52,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 53,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 54,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 55,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 64,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 65,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 66,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 67,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 68,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 69,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 70,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 71,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 80,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 81,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 82,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 83,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 84,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 85,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 86,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 87,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 96,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 97,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 98,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 99,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 100,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 101,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 102,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 103,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 112,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 113,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 114,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 115,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 116,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 117,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 118,
          "type": "notebutton"
        },
        {
          "channel": 1,
          "mode": "trigger",
          "note": 119,
          "type": "notebutton"
        }
      ]
    }
  ]
};

export const ABLETON_OVERLAY = {
  "id": "ableton_performance",
  "name": "Ableton Performance",
  "cells": [
    {
      "type": "horiz-mixer",
      "horiz": [
        {
          "cc": 10,
          "channel": 1,
          "label": "Volume 1",
          "mode": "relative",
          "type": "ccslider"
        },
        {
          "cc": 20,
          "channel": 1,
          "label": "Volume 2",
          "mode": "relative",
          "type": "ccslider"
        },
        {
          "cc": 30,
          "channel": 1,
          "label": "Volume 3",
          "mode": "relative",
          "type": "ccslider"
        },
        {
          "cc": 40,
          "channel": 1,
          "label": "Volume 4",
          "mode": "relative",
          "type": "ccslider"
        },
        {
          "cc": 50,
          "channel": 1,
          "label": "Volume 5",
          "mode": "relative",
          "type": "ccslider"
        },
        {
          "cc": 60,
          "channel": 1,
          "label": "Volume 6",
          "mode": "relative",
          "type": "ccslider"
        },
        {
          "cc": 70,
          "channel": 1,
          "label": "Volume 7",
          "mode": "relative",
          "type": "ccslider"
        },
        {
          "cc": 80,
          "channel": 1,
          "label": "Volume 8",
          "mode": "relative",
          "type": "ccslider"
        }
      ]
    },
    {
      "id": "returns",
      "type": "vert-mixer",
      "vert": [
        {
          "cc": 90,
          "channel": 1,
          "label": "Reverb",
          "mode": "snapback",
          "type": "ccslider",
          "vertical": true
        },
        {
          "cc": 91,
          "channel": 1,
          "label": "Filter",
          "mode": "snapback",
          "type": "ccslider",
          "vertical": true
        },
        {
          "cc": 92,
          "channel": 1,
          "label": "Test",
          "mode": "absolute",
          "type": "ccslider",
          "vertical": true
        }
      ]
    }
  ]
};