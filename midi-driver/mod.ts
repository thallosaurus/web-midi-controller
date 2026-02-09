const BUILD_TYPE = Deno.env.get("CARGO_BUILD_TYPE") ?? "debug";

export type { CCPayload, MidiMessage, MidiPayload, NotePayload } from "./bindings/MidiPayload.ts";

function getDefaultLibraryPath() {
  const path = {
    windows: "../target/" + BUILD_TYPE + "/libmidi_driver.dll",
    linux: "../target/" + BUILD_TYPE + "/libmidi_driver.so",
    darwin: "../target/" + BUILD_TYPE + "/libmidi_driver.dylib",
    aix: null,
    netbsd: null,
    android: null,
    freebsd: null,
    solaris: null,
    illumos: null,
  }[Deno.build.os];

  if (!path) throw new Error("library is not supported on this system: " + Deno.build.os)
  return path;
}

interface MidiDriverFFI extends Deno.ForeignLibraryInterface {
  start_driver: {
    parameters: [],
    result: "void"
  },
  poll_event: {
    parameters: [],
    result: "pointer",
  },
  free_string: {
    parameters: ["pointer"],
    result: "void"
  },
  send_midi: {
    parameters: ["pointer"],
    result: "void"
  },
  stop_driver: {
    parameters: [],
    result: "void"
  }
}

export class MidiDriver {
  static dylib: Deno.DynamicLibrary<MidiDriverFFI> | null
  public emitter = new EventTarget();
  private pollInterval: number;
  constructor(path = getDefaultLibraryPath()) {
    if (MidiDriver.dylib) throw new Error("midi driver is already loaded");
    MidiDriver.dylib = Deno.dlopen<MidiDriverFFI>(
      path!,
      {
        start_driver: {
          parameters: [],
          result: "void"
        },
        poll_event: {
          parameters: [],
          result: "pointer",
        },
        free_string: {
          parameters: ["pointer"],
          result: "void"
        },
        send_midi: {
          parameters: ["pointer"],
          result: "void"
        },
        stop_driver: {
          parameters: [],
          result: "void"
        }
      } as const,
    );

    this.pollInterval = setInterval(this.poll.bind(this), 100);

    MidiDriver.dylib.symbols.start_driver();

    //this.emitter.addEventListener("data", this.customEventHandler.bind(this));
  }

  customEventHandler(ev: Event): void {
    const e = ev as CustomEvent;
    console.log(e.detail);
  }

  sendMidi(event: object) {
    const encoder = new TextEncoder();
    const json = JSON.stringify(event);
    const bytes = encoder.encode(json);

    const ptr = Deno.UnsafePointer.of(new Uint8Array(bytes));
    MidiDriver.dylib!.symbols.send_midi(ptr);
  }

  poll() {

    do {
      const ptr = MidiDriver.dylib!.symbols.poll_event();
      if (!ptr) break;
      const msg = new Deno.UnsafePointerView(ptr!).getCString();
      MidiDriver.dylib!.symbols.free_string(ptr);

      const serialized = JSON.parse(msg);

      // process event

      this.emitter.dispatchEvent(new CustomEvent("data", { detail: serialized }))

    } while (true);
  }

  close() {
    if (MidiDriver.dylib) {

      MidiDriver.dylib.symbols.stop_driver();
      clearInterval(this.pollInterval);
      MidiDriver.dylib.close();
      
      MidiDriver.dylib = null;
    }
  }
}

//const driver = new MidiDriver();