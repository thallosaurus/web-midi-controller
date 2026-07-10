import type { ButtonMode, CCButtonProperties, CCSliderProperties, GridMixerProperties, NoteButtonProperties, RotaryMode, RotarySliderProperties, SliderMode, VerticalMixerProperties, Widget } from "@hdj/definitions";

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

const MPC_MATRIX_MAP = [
  48, 49, 50, 51,
  44, 45, 46, 47,
  40, 41, 42, 43,
  36, 37, 38, 39
]

export function createRotaries(label: string, ch: number, cc: number, mode: RotaryMode, htmlId: string | null = null): RotarySliderProperties & Widget {
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

export function createMPCMatrix(ch: number, htmlId = null): Widget & GridMixerProperties {
  return createMatrix(ch, 4, 4, MPC_MATRIX_MAP, htmlId);
}

export function createLaunchpadMatrix(ch: number, htmlId = null): Widget & GridMixerProperties {
  return createMatrix(ch, 8, 8, DEFAULT_MATRIX_MAP, htmlId);
}

export function createMatrix(ch: number, w: number, h: number, a = DEFAULT_MATRIX_MAP, htmlId = null): GridMixerProperties & Widget {
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

export function createCCSlider(label: string, channel: number, cc: number, mode: SliderMode, vertical: boolean, htmlId: string | null = null): CCSliderProperties & Widget {
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

export function createMidiNoteButton(label: string, channel: number, note: number, mode: ButtonMode, htmlId: string | null = null): NoteButtonProperties & Widget {
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

export function createMidiCCButton(label: string, channel: number, cc: number, mode: ButtonMode, htmlId: string | null = null): CCButtonProperties & Widget {
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