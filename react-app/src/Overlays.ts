import { ButtonMode, CCSliderProperties, GridMixerProperties, HorizontalMixerProperties, NoteButtonProperties, Overlay, SliderMode, VerticalMixerProperties, Widget } from "@hdj/definitions";

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

function createCCSlider(label: string, channel: number, cc: number, mode: SliderMode, vertical: boolean): CCSliderProperties & Widget {
  return {
    id: null,
    type: "ccslider",
    output: "midi",
    cc,
    channel,
    label,
    mode,
    vertical,
    value: 0,
    default_value: 0,
    value_off: 0,
  }
}

function createMidiNoteButton(label: string, channel: number, note: number, mode: ButtonMode): NoteButtonProperties & Widget {
  return {
    id: null,
    type: "notebutton",
    output: "midi",
    channel,
    note,
    label,
    mode
  }
}

export const ABLETON_OVERLAY: Overlay = {
  "id": "ableton_performance",
  "name": "Ableton Performance",
  "cells": [
    {
      "type": "horiz-mixer",
      id: "volumes",
      "horiz": [
        createCCSlider("Volume 1", 1, 10, "relative", false),
        createCCSlider("Volume 2", 1, 20, "relative", false),
        createCCSlider("Volume 3", 1, 30, "relative", false),
        createCCSlider("Volume 4", 1, 40, "relative", false),
        createCCSlider("Volume 5", 1, 50, "relative", false),
        createCCSlider("Volume 6", 1, 60, "relative", false),
        createCCSlider("Volume 7", 1, 70, "relative", false),
        createCCSlider("Volume 8", 1, 80, "relative", false)
      ]
    },
    {
      "id": "returns",
      "type": "vert-mixer",
      "vert": [
        createCCSlider("Reverb", 1, 90, "snapback", true),
        createCCSlider("Filter", 1, 91, "snapback", true),
        createCCSlider("Test", 1, 92, "absolute", true)
      ]
    }
  ]
};

function createOneDeviceTraktorDeck(channel: number): VerticalMixerProperties & Widget {
  return {
    "type": "vert-mixer",
    "vert": [
      {
        "h": 2,
        "id": `deck_${channel}_loop`,
        "type": "grid-mixer",
        "w": 4,
        "grid": [
          createMidiNoteButton("1/4 Loop", channel, 16, "trigger"),
          createMidiNoteButton("1/2 Loop", channel, 15, "trigger"),
          createMidiNoteButton("1 Loop", channel, 14, "trigger"),
          createMidiNoteButton("2 Loop", channel, 13, "trigger"),
          createMidiNoteButton("4 Loop", channel, 12, "trigger"),
          createMidiNoteButton("8 Loop", channel, 11, "trigger"),
          createMidiNoteButton("16 Loop", channel, 10, "trigger"),
          createMidiNoteButton("32 Loop", channel, 9, "trigger")
        ]
      },
      {
        "type": "vert-mixer",
        "id": `deck_${channel}_eq`,
        "vert": [
          createCCSlider("Bass", channel, 17, "snapback", true),
          createCCSlider("Mid", channel, 16, "snapback", true),
          createCCSlider("Hi", channel, 15, "snapback", true),
        ]
      },
      {
        "type": "horiz-mixer",
        "id": `deck_${channel}_transport`,
        "horiz": [
          createMidiNoteButton("Play/Pause", channel, 1, "trigger"),
          createMidiNoteButton("Sync", channel, 2, "trigger")
        ]
      }
    ]
  }
}

export const TRAKTOR_PERFORMANCE: Overlay = {
  "id": "traktor_performance",
  "name": "One-device Traktor 2.0",
  "style": `#deck_1_eq, #deck_2_eq {
    /*flex-grow: 1;*/
  }`,
  "channel": null,
  "program": null,
  "cells": [
        createOneDeviceTraktorDeck(1),
    {
      "id": "levels",
      "type": "horiz-mixer",
      "horiz": [
        createCCSlider("Test", 1, 0, "relative", false),
        createCCSlider("Test", 2, 0, "relative", false)
      ]
    },
   createOneDeviceTraktorDeck(2)
  ]
}