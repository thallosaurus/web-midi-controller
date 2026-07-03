import { CCSliderProperties, HorizontalMixerProperties, NoteButtonProperties, Overlay, VerticalMixerProperties, Widget } from "@hdj/definitions";

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

const deckA: Widget & VerticalMixerProperties = {
  id: "deck_a",
  type: "vert-mixer",
  vert: [{
    "type": "ccslider",
    "cc": 1,
    "output": "midi",
    "channel": 1,
    "label": "Deck A",
    "mode": "absolute",
    "vertical": false,
    "value": 0,
    "value_off": 0,
    "id": "volume_decka",
    "default_value": 0
  }, {
    "output": "midi",
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
    "output": "midi",
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
    "output": "midi",
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
      "output": "midi",
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
      "output": "midi",
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
          "output": "midi",
          "note": 60,
          "x": {
            "output": "midi",
            "channel": 1,
            "cc": 4
          },
          "y": {
            "output": "midi",
            "channel": 1,
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
          "output": "midi",
          "mode": "trigger",
          "note": 0,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 1,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 2,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 3,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 4,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 5,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 6,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 16,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 17,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 18,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 19,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 20,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 21,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 22,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 23,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 24,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 32,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 33,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 34,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 35,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 36,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 37,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 38,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 39,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 48,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 49,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 50,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 51,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 52,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 53,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 54,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 55,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 64,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 65,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 66,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 67,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 68,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 69,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 70,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 71,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 80,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 81,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 82,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 83,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 84,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 85,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 86,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 87,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 96,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 97,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 98,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 99,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 100,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 101,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 102,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 103,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 112,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 113,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 114,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 115,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 116,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 117,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 118,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "mode": "trigger",
          "note": 119,
          "type": "notebutton"
        }
      ]
    }
  ]
};

export const MIDI_TEST_OVERLAY: Overlay = {
  name: "MIDI Test Overlay",
  channel: null,
  program: null,
  id: null,
  cells: [{
    "type": "ccslider",
    "output": "midi",
    "cc": 1,
    "channel": 1,
    "id": "test1",
    "label": "test",
    "mode": "absolute",
    "vertical": true,
    "value": 0,
    "value_off": 0,
    "default_value": 0
  },
  {
    "type": "ccslider",
    "output": "midi",
    "cc": 1,
    "channel": 1,
    "id": "test2",
    "label": "test",
    "mode": "absolute",
    "vertical": true,
    "value": 0,
    "value_off": 0,
    "default_value": 0
  },
  {
    "type": "ccslider",
    "output": "midi",
    "cc": 1,
    "channel": 1,
    "id": "test3",
    "label": "test",
    "mode": "absolute",
    "vertical": true,
    "value": 0,
    "value_off": 0,
    "default_value": 0
  }
  ],
};

export const ABLETON_OVERLAY: Overlay = {
  "id": "ableton_performance",
  "name": "Ableton Performance",
  "cells": [
    {
      "type": "horiz-mixer",
      "horiz": [
        {
          "id": null,
          "output": "midi",
          "vertical": false,
          "cc": 10,
          "channel": 1,
          "label": "Volume 1",
          "mode": "relative",
          "type": "ccslider",
        },
        {
          "output": "midi",
          "cc": 20,
          "channel": 1,
          "label": "Volume 2",
          "mode": "relative",
          "type": "ccslider"
        },
        {
          "output": "midi",
          "cc": 30,
          "channel": 1,
          "label": "Volume 3",
          "mode": "relative",
          "type": "ccslider"
        },
        {
          "output": "midi",
          "cc": 40,
          "channel": 1,
          "label": "Volume 4",
          "mode": "relative",
          "type": "ccslider"
        },
        {
          "output": "midi",
          "cc": 50,
          "channel": 1,
          "label": "Volume 5",
          "mode": "relative",
          "type": "ccslider"
        },
        {
          "output": "midi",
          "cc": 60,
          "channel": 1,
          "label": "Volume 6",
          "mode": "relative",
          "type": "ccslider"
        },
        {
          "output": "midi",
          "cc": 70,
          "channel": 1,
          "label": "Volume 7",
          "mode": "relative",
          "type": "ccslider"
        },
        {
          "output": "midi",
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
          "output": "midi",
          "cc": 90,
          "channel": 1,
          "label": "Reverb",
          "mode": "snapback",
          "type": "ccslider",
          "vertical": true
        },
        {
          "output": "midi",
          "cc": 91,
          "channel": 1,
          "label": "Filter",
          "mode": "snapback",
          "type": "ccslider",
          "vertical": true
        },
        {
          "output": "midi",
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

export const TRAKTOR_PERFORMANCE = {
  "id": "traktor_performance",
  "name": "One-device Traktor 2.0",
  "cells": [
    {
      "type": "vert-mixer",
      "vert": [
        {
          "h": 2,
          "id": "deck_a",
          "type": "grid-mixer",
          "w": 4,
          "grid": [
            {
              "output": "midi",
              "channel": 1,
              "label": "1/4 Loop",
              "mode": "trigger",
              "note": 16,
              "type": "notebutton"
            },
            {
              "output": "midi",
              "channel": 1,
              "label": "1/2 Loop",
              "mode": "trigger",
              "note": 15,
              "type": "notebutton"
            },
            {
              "output": "midi",
              "channel": 1,
              "label": "1 Loop",
              "mode": "trigger",
              "note": 14,
              "type": "notebutton"
            },
            {
              "output": "midi",
              "channel": 1,
              "label": "2 Loop",
              "mode": "trigger",
              "note": 13,
              "type": "notebutton"
            },
            {
              "output": "midi",
              "channel": 1,
              "label": "4 Loop",
              "mode": "trigger",
              "note": 12,
              "type": "notebutton"
            },
            {
              "output": "midi",
              "channel": 1,
              "label": "8 Loop",
              "mode": "trigger",
              "note": 11,
              "type": "notebutton"
            },
            {
              "output": "midi",
              "channel": 1,
              "label": "16 Loop",
              "mode": "trigger",
              "note": 10,
              "type": "notebutton"
            },
            {
              "output": "midi",
              "channel": 1,
              "label": "32 Loop",
              "mode": "trigger",
              "note": 9,
              "type": "notebutton"
            }
          ]
        },
        {
          "type": "horiz-mixer",
          "horiz": [
            {
              "output": "midi",
              "cc": 17,
              "channel": 1,
              "default_value": 64,
              "label": "Bass",
              "mode": "snapback",
              "type": "rotary"
            },
            {
              "output": "midi",
              "cc": 16,
              "channel": 1,
              "default_value": 64,
              "label": "Mid",
              "mode": "snapback",
              "type": "rotary"
            },
            {
              "output": "midi",
              "cc": 15,
              "channel": 1,
              "default_value": 64,
              "label": "Hi",
              "mode": "snapback",
              "type": "rotary"
            }
          ]
        },
        {
          "type": "horiz-mixer",
          "horiz": [
            {
              "output": "midi",
              "channel": 1,
              "label": "Play/Pause",
              "mode": "trigger",
              "note": 1,
              "type": "notebutton"
            },
            {
              "output": "midi",
              "channel": 1,
              "label": "Sync",
              "mode": "trigger",
              "note": 2,
              "type": "notebutton"
            }
          ]
        }
      ]
    },
    {
      "id": "levels",
      "type": "horiz-mixer",
      "horiz": [
        {
          "output": "midi",
          "cc": 0,
          "channel": 1,
          "label": "Test",
          "mode": "relative",
          "type": "ccslider"
        },
        {
          "output": "midi",
          "cc": 1,
          "channel": 1,
          "label": "Test",
          "mode": "relative",
          "type": "ccslider"
        }
      ]
    },
    {
      "h": 8,
      "id": "deck_b",
      "type": "grid-mixer",
      "w": 4,
      "grid": [
        {
          "output": "midi",
          "channel": 1,
          "label": "1/4 Loop",
          "mode": "trigger",
          "note": 36,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "label": "1/2 Loop",
          "mode": "trigger",
          "note": 35,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "label": "1 Loop",
          "mode": "trigger",
          "note": 34,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "label": "2 Loop",
          "mode": "trigger",
          "note": 33,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "label": "4 Loop",
          "mode": "trigger",
          "note": 32,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "label": "8 Loop",
          "mode": "trigger",
          "note": 31,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "label": "16 Loop",
          "mode": "trigger",
          "note": 30,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "label": "32 Loop",
          "mode": "trigger",
          "note": 29,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "label": "Kill Bass",
          "mode": "trigger",
          "note": 47,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "label": "Kill Mid",
          "mode": "trigger",
          "note": 48,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "label": "Kill Hi",
          "mode": "trigger",
          "note": 49,
          "type": "notebutton"
        },
        {
          "type": "empty"
        },
        {
          "output": "midi",
          "channel": 1,
          "label": "Play/Pause",
          "mode": "trigger",
          "note": 21,
          "type": "notebutton"
        },
        {
          "output": "midi",
          "channel": 1,
          "label": "Sync",
          "mode": "trigger",
          "note": 22,
          "type": "notebutton"
        }
      ]
    }
  ]
}