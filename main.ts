import { Hono } from "hono";
import { websocketMiddleware } from "./src/socket.ts";
import { get_custom_css, load_overlays } from "./src/overlays.ts";
import { serveStatic } from "hono/deno";
import { parseArgs } from "jsr:@std/cli/parse-args";
//import { logger } from "hono/logger";

//import type { CCSliderEvent } from "./web/src/events";

if (import.meta.main) {
  //console.log(html)

  const flags = parseArgs(Deno.args, {
    string: ["path", "port", "address"],
    default: {
      path: Deno.cwd() + "/overlays",
      port: 8888,
      address: "0.0.0.0"
    }
  })

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
    const ol = await load_overlays(flags.path);
    return c.json(ol);
  });

  app.get("/custom.css", async (c) => {
    const ol = await get_custom_css(flags.path);
    
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
    port: Number(flags.port),
    hostname: flags.address,
    handler: app.fetch,
  });
}
