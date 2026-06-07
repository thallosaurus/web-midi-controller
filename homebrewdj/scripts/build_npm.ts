// ex. scripts/build_npm.ts
import { build, emptyDir } from "@deno/dnt";

await emptyDir("./dist/client");

await build({
  entryPoints: ["./client/index.ts"],
  outDir: "./dist/client",
  shims: {
    // see JS docs for overview and more options
    deno: true,
  },
  package: {
    // package.json properties
    name: "@hdj/homebrewdj-web-client",
    version: Deno.args[0],
    description: "Your package.",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/thallosaurus/web-midi-controller.git",
    },
    bugs: {
      url: "https://github.com/thallosaurus/web-midi-controller/issues",
    },
  },
  postBuild() {
    // steps to run after building and before running the tests
    //Deno.copyFileSync("LICENSE", "npm/LICENSE");
    //Deno.copyFileSync("README.md", "npm/README.md");
  },
});