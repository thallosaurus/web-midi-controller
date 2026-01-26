import { Hono } from "hono";
import { websocketMiddleware } from "./src/socket.ts";
import { get_custom_css, load_overlays } from "./src/overlays.ts";
import { serveStatic } from "hono/deno";
//import { logger } from "hono/logger";

//import type { CCSliderEvent } from "./web/src/events";

if (import.meta.main) {
  //console.log(html)
  const app = new Hono();
  //app.use("*", logger());
  //console.log(Deno.cwd(), import.meta.dirname);
  /*app.use(
    "/overlays/css/*",
    logger(),
    serveStatic({
      root: Deno.cwd() + "/",
    }),
  );*/
  app.get("/overlays", async (c) => {
    const ol = await load_overlays(Deno.cwd() + "/overlays");
    return c.json(ol);
  });

  app.get("/custom.css", async (c) => {
    const ol = await get_custom_css(Deno.cwd() + "/overlays");
    
    return new Response(ol, {
      headers: {
        "Content-Type": "text/css"
      }
    })
  })

  app.get("/ws", websocketMiddleware);

  app.use(
    "*",
    serveStatic({
      root: import.meta.dirname + "/web/dist",
    }),
  );

  Deno.serve({
    port: 8888,
    handler: app.fetch,
  });
}
