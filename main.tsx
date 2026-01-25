import { Hono } from "hono";
import { websocketMiddleware } from "./src/socket.ts";
import { load_overlays } from "./src/overlays.tsx";
import { serveStatic } from "hono/deno";

//import type { CCSliderEvent } from "./web/src/events";



if (import.meta.main) {
  const ol = await load_overlays("./overlays")
  //const html = render_html(ol);
  //console.log(html)
  const app = new Hono();
  //app.get("/", (c) => c.text("Hello Deno!"))
  /*app.get("/", (c) => {
    return c.html(<Index overlays={ol}></Index>)
  })*/

  app.use("*", serveStatic({
    root: import.meta.dirname + "/web/dist",
  }))
  app.get("/overlays", (c) => {
    return c.json(ol);
  })
  //app.get("")
  app.get("/ws", websocketMiddleware)
  Deno.serve({
    port: 8888,
    handler: app.fetch});
}