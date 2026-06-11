import { HomebrewDJControllerOnly } from "../homebrewdj.ts";

const hdj = new HomebrewDJControllerOnly(Deno.args[0])
Deno.addSignalListener("SIGINT", () => {
  hdj.close();
});