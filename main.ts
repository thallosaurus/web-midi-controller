import { Hono } from "hono";
import { websocketMiddleware } from "./src/socket.ts";
import { load_overlays } from "./src/overlays.ts";
import { serveStatic } from "hono/deno";

//import type { CCSliderEvent } from "./web/src/events";

if (import.meta.main) {
  //const html = render_html(ol);
  //console.log(html)
  const app = new Hono();
  app.use(
    "*",
    serveStatic({
      root: import.meta.dirname + "/web/dist",
    }),
  );
  app.get("/overlays", async (c) => {
    const ol = await load_overlays("./overlays");
    return c.json(ol);
  });
  app.use(
    "/overlays/css/*",
    serveStatic({
      root: "./overlays/css",
    }),
  );

  app.get("/ws", websocketMiddleware);
  Deno.serve({
    port: 8888,
    handler: app.fetch,
  });
}
