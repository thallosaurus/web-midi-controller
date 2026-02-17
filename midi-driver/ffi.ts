const BUILD_TYPE = Deno.env.get("CARGO_BUILD_TYPE") ?? "debug";
const LIBRARY_PATH = Deno.env.get("LIBRARY_PATH") ?? "../target/" + BUILD_TYPE

function getDefaultLibraryPath() {
  const path = {
    windows: new URL(LIBRARY_PATH + "/midi_driver.dll", import.meta.url),
    linux: new URL(LIBRARY_PATH + "/libmidi_driver.so", import.meta.url),
    darwin: new URL(LIBRARY_PATH + "/libmidi_driver.dylib", import.meta.url),
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
    parameters: ["u8"];
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

interface MidiDriverOptions {
  pollBytes: boolean,
  useVirtual: boolean,
  libraryPath?: string
}

export class MidiDriver {
  private static dylib: Deno.DynamicLibrary<MidiDriverFFI> | null;
  public emitter = new EventTarget();
  private pollInterval: number | null = null;
  constructor(options: MidiDriverOptions) {
    if (MidiDriver.dylib) throw new Error("midi driver is already loaded");
    try {
      MidiDriver.dylib = Deno.dlopen<MidiDriverFFI>(
        options.libraryPath ?? getDefaultLibraryPath(),
        {
          start_driver: {
            parameters: ["u8"],
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

      if (options.pollBytes) {
        this.pollInterval = setInterval(this.pollBytes.bind(this), 100);
      } else {
        this.pollInterval = setInterval(this.poll.bind(this), 100);
      }

      MidiDriver.dylib.symbols.start_driver(Number(options.useVirtual));
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

  convertBytes(bytes: Uint8Array) {
    if (MidiDriver.dylib !== null) {

    }
  }

  pollBytes() {
    if (MidiDriver.dylib !== null) {
      let retData = null;

      do {
        const buffer = new Uint8Array(8);
        const ptr = Deno.UnsafePointer.of(buffer);
        
        const bytesWritten = Number(MidiDriver.dylib.symbols.poll_bytes(ptr, BigInt(buffer.length)));
        
        retData = buffer.subarray(0, bytesWritten);
        
        if (retData.length > 0) {
          const dataPtr = Deno.UnsafePointer.of(retData);
          const m = MidiDriver.dylib.symbols.convert_bytes(dataPtr, BigInt(retData.length))
          const ptrView = new Deno.UnsafePointerView(m!).getCString()
          const obj = JSON.parse(ptrView);
          MidiDriver.dylib.symbols.free_string(m);
          
          this.emitter.dispatchEvent(
            new CustomEvent("data", { detail: obj }),
          );
        } else {
          retData = null;
        }
      } while (retData !== null);
      //console.log("MIDI bytes", eventBytes);
    }
  }

  poll() {
    if (MidiDriver.dylib !== null) {
      do {
        const ptr = MidiDriver.dylib!.symbols.poll_event();
        if (!ptr) break;
        const msg = new Deno.UnsafePointerView(ptr!).getCString();
        
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
