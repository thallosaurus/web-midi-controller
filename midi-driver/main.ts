const BUILD_TYPE = "debug"

function getLibraryPath() {
  return {
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
}



// Calculate the 10th Fibonacci number
//const result = dylib.symbols.fibonacci(10);
//console.log(`Fibonacci(10) = ${result}`); // 55






const encoder = new TextEncoder();



//dylib.close();

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
}

export class MidiDriver {
  static dylib: Deno.DynamicLibrary<MidiDriverFFI>
  private emitter = new EventTarget();
  private pollInterval: number;
  constructor() {
    MidiDriver.dylib = Deno.dlopen<MidiDriverFFI>(
      getLibraryPath()!,
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
      } as const,
    );

    this.pollInterval = setInterval(this.poll.bind(this), 100);

    MidiDriver.dylib.symbols.start_driver();
  }

  sendMidi(event: object) {
    const json = JSON.stringify(event);
    const bytes = encoder.encode(json);

    const ptr = Deno.UnsafePointer.of(new Uint8Array(bytes));
    MidiDriver.dylib.symbols.send_midi(ptr);
  }

  poll() {
    const ptr = MidiDriver.dylib.symbols.poll_event();
    if (ptr) {
      const msg = new Deno.UnsafePointerView(ptr).getCString();
      MidiDriver.dylib.symbols.free_string(ptr);
      console.log("EVENT FROM RUST:", msg);

      this.emitter.dispatchEvent(new CustomEvent("data", { detail: msg }))
    }
  }

  close() {

    MidiDriver.dylib.close();
  }
}

const driver = new MidiDriver();