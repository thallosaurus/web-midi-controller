import { parseArgs } from "@args";

interface MidiSettings {
    pollBytes: boolean,
    useVirtual: boolean,
    inputName: string
    outputName: string,
    systemChannel: number
}

export interface ServerSettings {
    midi: MidiSettings,
    path: {
        overlayPath: string
    }
}

export function parseArguments(): ServerSettings {
    const flags = parseArgs(Deno.args, {
        boolean: ["virtual"],
        string: ["inputName", "outputName", "systemChannel"],
        default: { virtual: true, systemChannel: String(15) }
    })

    if (Deno.build.os == "windows") flags.virtual = false;

    return {
        midi: {
            pollBytes: true,
            useVirtual: flags.virtual,
            inputName: (flags.inputName ?? "homebrewdj input"),
            outputName: (flags.outputName ?? "homebrewdj output"),
            systemChannel: Number(flags.systemChannel)
        },
        path: {
            overlayPath: "../overlays"
        }
    }
}