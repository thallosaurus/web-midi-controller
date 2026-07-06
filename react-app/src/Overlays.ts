import { ButtonMode, CCButtonProperties, CCSliderProperties, GridMixerProperties, HorizontalMixerProperties, NoteButtonProperties, Overlay, RotaryMode, RotarySliderProperties, SliderMode, VerticalMixerProperties, Widget } from "@hdj/definitions";

const TestOscWidget: Widget & CCSliderProperties = {
  output: "osc",
  address: "/test",
  label: "osc-test",
  mode: "absolute",
  type: "ccslider",
  id: null,
  vertical: false,
  cc: 3,
  value: null
}

export const TestOscOverlay: Overlay = {
  id: "test_osc",
  name: "OSC Test Overlay",
  style: null,
  channel: null,
  program: null,
  cells: [TestOscWidget]
}

function createDeck(ch: number): Widget & VerticalMixerProperties {
  return {
    id: "volume_deck" + ch,
    type: "vert-mixer",
    vert: [
      createCCSlider("Deck A", ch, 1, "absolute", false),
      createMidiNoteButton("Mixer Cue", ch, 33, "latch", "mixercue_deck"+ch)]
  }
}

export const VOLUME_SLIDER_OVERLAY_NEW: Overlay = {
  name: "Volume Sliders (New)",
  channel: null,
  program: null,
  style: `
    #volume_slider_overlay_new #mixercue_deck1, 
    #volume_slider_overlay_new #mixercue_deck2 {
      flex-shrink: 4;
      width: 50%;
    }
    #volume_slider_overlay_new #volume_deck1 .slider, 
    #volume_slider_overlay_new #volume_deck2 .slider {
      width: 50%;
    }
  `,
  id: "volume_slider_overlay_new",
  cells: [createDeck(1), createDeck(2)]
}

export const VOLUME_SLIDER_OVERLAY: Overlay = {
  name: "Volume Sliders",
  channel: null,
  program: null,
  style: null,
  id: "volume_slider_overlay",
  cells: [{
    type: "horiz-mixer",
    id: null,
    horiz: [
      createCCSlider("Deck A", 1, 1, "absolute", false),
      createCCSlider("Deck B", 2, 1, "absolute", false)
    ]
  }]
};

export const XYPAD_PERFORMANCE: Overlay = {
  "id": "xypad-performance",
  "name": "XYPad Performance",
  program: null,
  channel: null,
  style: `#perf-mixer {
    width: 20% !important;
    height: 60% !important;

  }  
  `,
  "cells": [{
      "type": "horiz-mixer",
      "id": "horiz",
      "horiz": [
        {
          "channel": 1,
          "label": "XY Pad",
          "type": "xypad",
          "output": "midi",
          "note": 60,
          "velocity": 127,
          "id": "xy-pad-w",
          "x": {
            "output": "midi",
            "channel": 1,
            "cc": 4,
            "value": null
          },
          "y": {
            "output": "midi",
            "channel": 1,
            "cc": 5,
            "value": null
          }
        },
        {
          type: "vert-mixer",
          id: "perf-mixer",
          vert: [
            //createCCSlider("XFade", 1, 13, "snapback", true),
            createMidiNoteButton("Previous", 16, 66, "trigger", "prev-scene"),
            createMidiNoteButton("Play Selected Scene", 16, 68, "trigger", "play-scene"),
            createMidiNoteButton("Next", 16, 67, "trigger", "next-scene"),
            createMidiCCButton("XFade", 1, 13, "trigger", "xfade")
          ]
        }
      ]
    }]
}

export const XYPAD_OVERLAY: Overlay = {
  "id": "fullscreen-xy-pad",
  "name": "Fullscreen XY Pad",
  "program": 0,
  "channel": null,
  "style": null,
  "cells": [
    {
      "type": "vert-mixer",
      "id": "vert",
      "vert": [
        {
          "channel": 1,
          "label": "XY Pad",
          "type": "xypad",
          "output": "midi",
          "note": 60,
          "velocity": 127,
          "id": "xy-pad-w",
          "x": {
            "output": "midi",
            "channel": 1,
            "cc": 4,
            "value": null
          },
          "y": {
            "output": "midi",
            "channel": 1,
            "cc": 5,
            "value": null
          }
        }
      ]
    }
  ]
}

const DEFAULT_MATRIX_MAP = [
  0, 1, 2, 3, 4, 5, 6, 16,
  17, 18, 19, 20, 21, 22, 23, 24,
  32, 33, 34, 35, 36, 37, 38, 39,
  48, 49, 50, 51, 52, 53, 54, 55,
  64, 65, 66, 67, 68, 69, 70, 71,
  80, 81, 82, 83, 84, 85, 86, 87,
  96, 97, 98, 99, 100, 101, 102, 103,
  112, 113, 114, 115, 116, 117, 118, 119
];

function createRotaries(label: string, ch: number, cc: number, mode: RotaryMode, htmlId: string | null = null): RotarySliderProperties & Widget {
  return {
    id: htmlId,
    type: "rotary",
    output: "midi",
    cc,
    channel: ch,
    mode,
    label,
    value: null
  }
}

export const ROTARIES_TEST: Overlay = {
  name: "Rotaries Test",
  channel: null,
  program: null,
  style: null,
  id: "rotaries_test",
  cells: [
    createRotaries("test", 1, 1, "relative"),
    createRotaries("test", 1, 2, "relative"),
    createRotaries("test", 1, 3, "relative"),
  ],
}

function createMatrix(ch: number, w: number, h: number, a = DEFAULT_MATRIX_MAP, htmlId = null): GridMixerProperties & Widget {
  return {
    "id": htmlId,
    "type": "grid-mixer",
    "h": h,
    "w": w,
    "grid": a.map((v) => {
      return createMidiNoteButton("", ch, v, "trigger")
    })
  }
}

export const MATRIX_OVERLAY: Overlay = {
  "id": "note-midi-grid",
  "name": "8x8 MIDI Grid",
  channel: null,
  program: null,
  style: `
  #note-midi-grid .grid {
    width: 80% !important;
  }
  `,
  "cells": [
    createMatrix(1, 8, 8)
  ]
};

export const MIDI_TEST_OVERLAY: Overlay = {
  name: "MIDI Test Overlay",
  channel: null,
  program: null,
  id: null,
  style: null,
  cells: [
    createCCSlider("test", 1, 1, "absolute", true, "test1"),
    createCCSlider("test", 1, 1, "absolute", true, "test2"),
    createCCSlider("test", 1, 1, "absolute", true, "test3")
  ],
};

function createCCSlider(label: string, channel: number, cc: number, mode: SliderMode, vertical: boolean, htmlId: string | null = null): CCSliderProperties & Widget {
  return {
    id: htmlId,
    type: "ccslider",
    output: "midi",
    cc,
    channel,
    label,
    mode,
    vertical,
    value: null,
  }
}

function createMidiNoteButton(label: string, channel: number, note: number, mode: ButtonMode, htmlId: string | null = null): NoteButtonProperties & Widget {
  return {
    id: htmlId,
    type: "notebutton",
    output: "midi",
    channel,
    note,
    label,
    mode
  }
}

function createMidiCCButton(label: string, channel: number, cc: number, mode: ButtonMode, htmlId: string | null = null): CCButtonProperties & Widget {
  return {
    id: htmlId,
    type: "ccbutton",
    output: "midi",
    channel,
    cc,
    value: null,
    label,
    mode
  }
}

export const ABLETON_OVERLAY: Overlay = {
  "id": "ableton_performance",
  "name": "Ableton Performance",
  "channel": null,
  program: null,
  style: `
  #ableton_performance #returns {
    height: 70% !important;
    align-self: center;
  }
  `,
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
    id: null,
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