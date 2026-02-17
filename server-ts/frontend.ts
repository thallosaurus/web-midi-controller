import { extname, join } from "https://deno.land/std/path/mod.ts"
import { HonoRequest } from "@hono/hono";
const distPath = new URL("../web/dist", import.meta.url);

export async function serveFrontend(req: HonoRequest) {
  let urlPath = new URL(req.url).pathname;

  if (urlPath === "/") urlPath = "/index.html";

  const fileUrl = new URL("." + urlPath, distPath);

  try {
    const file = await Deno.readFile(fileUrl);

    const contentType = getContentType(extname(urlPath));

    return new Response(file, {
      headers: { "content-type": contentType },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
};


function getContentType(ext: string) {
  switch (ext) {
    case ".html": return "text/html";
    case ".js": return "application/javascript";
    case ".css": return "text/css";
    case ".json": return "application/json";
    case ".png": return "image/png";
    case ".svg": return "image/svg+xml";
    default: return "application/octet-stream";
  }
}