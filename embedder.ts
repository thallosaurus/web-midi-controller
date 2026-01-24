import * as embedder from "jsr:@nfnitloop/deno-embedder"

const options = {
    importMeta: import.meta,

    mappings: [
        {
            sourceDir: "web/build",
            destDir: "embed/static"
        },
    ]
}

if (import.meta.main) {
    await embedder.main({options})
}