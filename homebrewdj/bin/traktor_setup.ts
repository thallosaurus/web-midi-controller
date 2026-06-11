import { HomebrewDJTraktorSetup } from "../homebrewdj.ts";

const hdj = new HomebrewDJTraktorSetup(Deno.args[0])
Deno.addSignalListener("SIGINT", () => {
  hdj.close();
});