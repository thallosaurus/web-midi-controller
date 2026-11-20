import type { MidiDriver } from "@hdj/midi-driver/ffi";
import type { MidiMessage } from "@hdj/midi-driver";
import type { PositionState, TickState, ControlState } from "./client/protocol.ts";

type BeatEmitterCallback = (payload: PositionState) => void;
type TickEmitterCallback = (payload: TickState) => void;
type ControlEmitterCallback = (payload: ControlState) => void;

export const TICK_PER_FOUR_BEAT = 96;

export class MidiClock {
  private driver: MidiDriver
  private clockTick = 0;
  private stopped = true;
  private emitter = new EventTarget();

  private lastTickTimestamp = 0;
  private lastTickDelta = 0;

  public addBeatListener(cb: BeatEmitterCallback) {
    this.emitter.addEventListener("beat", (ev) => {
      const d = (ev as CustomEvent).detail;
      cb(d);
    })
  }

  public addTickListener(cb: TickEmitterCallback) {
    this.emitter.addEventListener("tick", (ev) => {
      const d = (ev as CustomEvent).detail;
      cb(d);
    })
  }

  public addControlListener(cb: ControlEmitterCallback) {
    this.emitter.addEventListener("control", (ev) => {
      const d = (ev as CustomEvent).detail;
      cb(d);
    })
  }

  private sendBeatEvent() {
    this.emitter.dispatchEvent(new CustomEvent("beat", { detail: this.position }))
  }

  private sendTickEvent() {
    this.emitter.dispatchEvent(new CustomEvent("tick", { detail: this.tickState }))
  }

  private sendControlEvent(eventName: "Start" | "Stop" | "Continue") {
    this.emitter.dispatchEvent(new CustomEvent("control", {
      detail: {
        type: "control",
        eventName
      }
    }))
  }

  private bpmWindowSize: number;
  private bpmWindow: number[] = [];

  get bpm() {
    if (this.bpmWindow.length < this.bpmWindowSize) {
      return 0;
    }

    const totalMs = this.bpmWindow.reduce((a, b) => a + b, 0);
    const beats = this.bpmWindow.length / 24;
    return (beats * 60000) / totalMs;
  }

  get tickState(): TickState {
    return {
      type: "tick",
      tick: this.clockTick,
      timestamp: this.lastTickTimestamp,
      delta: this.lastTickDelta,
      //bpm: this.bpm
    }
  }

  get position(): PositionState {
    const tickInBar = this.clockTick % TICK_PER_FOUR_BEAT;
    return {
      type: "position",
      total: Math.floor(this.clockTick / TICK_PER_FOUR_BEAT),
      playing: !this.stopped,
      tick: tickInBar,
      beat: Math.floor(tickInBar / 24),
      sixteenth: Math.floor(tickInBar / 6)
    }
  }

  constructor(driver: MidiDriver, bpmWindowSize = TICK_PER_FOUR_BEAT) {
    driver.addEventListener(event => {
      //console.log(event.detail);
      this.processClock(event.detail);
    });
    this.bpmWindowSize = bpmWindowSize;

    this.driver = driver;
  }

  private updateTimestamps() {
    const now = performance.now();
    this.lastTickDelta = now - this.lastTickTimestamp;
    this.lastTickTimestamp = now;
    this.bpmWindow.push(this.lastTickDelta);

    if (this.bpmWindow.length > this.bpmWindowSize) {
      this.bpmWindow.shift();
    }
  }

  private processClock(ev: MidiMessage) {
    switch (ev.type) {
      case "Start":
        console.log("start")
        //this.updateTimestamps();
        //this.lastTick = performance.now();

        this.clockTick = 0;
        this.stopped = false;
        this.sendControlEvent(ev.type)
        this.sendTickEvent();
        this.sendBeatEvent();
        break;

      case "TimingClock":
        if (!this.stopped) {
          this.updateTimestamps();
          //this.lastTick = performance.now() - this.lastTick
          this.clockTick++;
          this.sendTickEvent();

          /*             if (this.clockTick % 24 === 0) {
                        //console.log("bar");
                      } */

          if (this.clockTick % 6 === 0) {
            //console.log("16th");
            this.sendBeatEvent();
          }
        }
        break;

      case "Continue":
        this.stopped = false;
        this.sendControlEvent(ev.type)
        break;

      case "Stop":
        this.stopped = true;
        this.sendControlEvent(ev.type)
        //this.sendBeatEvent();
        this.bpmWindow = [];
        break;
    }
  }
  close() {
    this.driver.close();
  }
}

//const clock = new MidiClock();

//clock.addBeatListener(console.log);
//clock.addTickListener(console.log);
//clock.addControlListener(console.log);