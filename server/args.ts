import { parseArgs } from "@args";

interface MidiSettings {
    pollBytes: boolean,
    useVirtual: boolean,
    inputName: string
    outputName: string
}

export interface ServerSettings {
    midi: MidiSettings
}

export function parseArguments(): ServerSettings {
    const flags = parseArgs(Deno.args, {
        boolean: ["virtual"],
        string: ["inputName", "outputName"]
    })

    if (Deno.build.os == "windows") flags.virtual = false;

    return {
        midi: {
            pollBytes: true,
            useVirtual: flags.virtual,
            inputName: (flags.inputName ?? "homebrewdj input"),
            outputName: (flags.outputName ?? "homebrewdj output")
        }
    }
}