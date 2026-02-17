const BUILD_TYPE = Deno.env.get("CARGO_BUILD_TYPE") ?? "debug";
const LIBRARY_PATH = Deno.env.get("LIBRARY_PATH") ?? "../target/" + BUILD_TYPE

export type {
  CCPayload,
  MidiMessage,
  MidiPayload,
  NotePayload,
} from "./bindings/MidiPayload.ts";

function getDefaultLibraryPath() {
  const path = {
    windows: LIBRARY_PATH + "/midi_driver.dll",
    linux: LIBRARY_PATH + "/libmidi_driver.so",
    darwin: LIBRARY_PATH + "/libmidi_driver.dylib",
    aix: null,
    netbsd: null,
    android: null,
    freebsd: null,
    solaris: null,
    illumos: null,
  }[Deno.build.os];

  if (!path) {
    throw new Error(
      "library is not supported on this system: " + Deno.build.os,
    );
  }
  return path;
}

interface MidiDriverFFI extends Deno.ForeignLibraryInterface {
  start_driver: {
    parameters: [];
    result: "void";
  };
  poll_event: {
    parameters: [];
    result: "pointer";
  };
  poll_bytes: {
    parameters: ["pointer", "usize"],
    result: "usize",
  };
  free_string: {
    parameters: ["pointer"];
    result: "void";
  };
  send_midi: {
    parameters: ["pointer"];
    result: "void";
  };
  stop_driver: {
    parameters: [];
    result: "void";
  };
  convert_bytes: {
    parameters: ["pointer", "usize"],
    result: "pointer"
  };
  free_bytes: {
    parameters: ["pointer"],
    result: "void",
  };
}

export class MidiDriver {
  static dylib: Deno.DynamicLibrary<MidiDriverFFI> | null;
  public emitter = new EventTarget();
  private pollInterval: number | null = null;
  constructor(path = getDefaultLibraryPath()) {
    if (MidiDriver.dylib) throw new Error("midi driver is already loaded");
    try {
      MidiDriver.dylib = Deno.dlopen<MidiDriverFFI>(
        path!,
        {
          start_driver: {
            parameters: [],
            result: "void",
          },
          poll_event: {
            parameters: [],
            result: "pointer",
          },
          poll_bytes: {
            parameters: ["pointer", "usize"],
            result: "usize",
          },
          free_string: {
            parameters: ["pointer"],
            result: "void",
          },
          send_midi: {
            parameters: ["pointer"],
            result: "void",
          },
          stop_driver: {
            parameters: [],
            result: "void",
          },
          convert_bytes: {
            parameters: ["pointer", "usize"],
            result: "pointer"
          },
          free_bytes: {
            parameters: ["pointer"],
            result: "void",
          },
        } as const,
      );

      this.pollInterval = setInterval(this.poll.bind(this), 100);

      MidiDriver.dylib.symbols.start_driver();
    } catch (e) {
      console.error("could not load midi driver", e);
      console.warn("midi output is disabled");
      MidiDriver.dylib = null;
    }
    //this.emitter.addEventListener("data", this.customEventHandler.bind(this));
  }

  customEventHandler(ev: Event): void {
    const e = ev as CustomEvent;
    console.log(e.detail);
  }

  sendMidi(event: object) {
    if (MidiDriver.dylib !== null) {
      const encoder = new TextEncoder();
      const json = JSON.stringify(event);
      const bytes = encoder.encode(json);

      const ptr = Deno.UnsafePointer.of(new Uint8Array(bytes));
      MidiDriver.dylib!.symbols.send_midi(ptr);
    }
  }

  poll_bytes() {
    if (MidiDriver.dylib !== null) {
      const buffer = new Uint8Array(1024);
      const ptr = Deno.UnsafePointer.of(buffer);

      const bytesWritten = Number(MidiDriver.dylib.symbols.poll_bytes(ptr, BigInt(buffer.length)));

      const eventBytes = buffer.subarray(0, bytesWritten);
      console.log("MIDI bytes", eventBytes);
    }
  }

  poll() {
    if (MidiDriver.dylib !== null) {
      do {
        const ptr = MidiDriver.dylib!.symbols.poll_event();
        if (!ptr) break;
        const msg = new Deno.UnsafePointerView(ptr!).getCString();

        //const converted = MidiDriver.dylib!.symbols.convert_bytes()


        MidiDriver.dylib!.symbols.free_string(ptr);

        const serialized = JSON.parse(msg);

        // process event

        this.emitter.dispatchEvent(
          new CustomEvent("data", { detail: serialized }),
        );
      } while (true);
    }
  }

  close() {
    if (MidiDriver.dylib) {
      MidiDriver.dylib.symbols.stop_driver();
      if (this.pollInterval) clearInterval(this.pollInterval);
      MidiDriver.dylib.close();

      MidiDriver.dylib = null;
    }
  }
}
