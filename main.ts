import { Hono } from "hono";
import { websocketMiddleware } from "./src/socket.ts";

//import type { CCSliderEvent } from "./web/src/events";



if (import.meta.main) {
  const app = new Hono();
  app.get("/", (c) => c.text("Hello Deno!"))
  app.get("/ws", websocketMiddleware)
  Deno.serve({
    port: 8888,
    handler: app.fetch});
}