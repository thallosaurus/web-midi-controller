import { HomebrewDJ } from "./homebrewdj.ts";

const hdj = new HomebrewDJ(Deno.args[0])
Deno.addSignalListener("SIGINT", () => {
  hdj.close();
});