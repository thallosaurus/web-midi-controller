import { Hono } from "hono";
import { websocketMiddleware } from "./src/socket.ts";
import { load_overlays } from "./src/overlays.ts";
import { serveStatic } from "hono/deno";
import { logger } from 'hono/logger';

//import type { CCSliderEvent } from "./web/src/events";

if (import.meta.main) {
  //const html = render_html(ol);
  //console.log(html)
  const app = new Hono();
  app.use("*", logger());
  app.use(
    "*",
    serveStatic({
      root: import.meta.dirname + "/web/dist",
    }),
  );
  //console.log(Deno.cwd(), import.meta.dirname);
  app.use(
    "/custom/*",
    serveStatic({
      root: Deno.cwd() + "/overlays/css",
    }),
  );
  app.get("/overlays", async (c) => {
    const ol = await load_overlays(Deno.cwd() + "/overlays");
    return c.json(ol);
  });

  app.get("/ws", websocketMiddleware);
  Deno.serve({
    port: 8888,
    handler: app.fetch,
  });
}
