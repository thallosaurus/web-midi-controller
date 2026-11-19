import { Context } from "https://deno.land/x/oak@v17.2.0/context.ts";

export const StaticAssets = "./webui/";

/**
 * Serves the web application's static assets.
 *
 * @param context Oak request context.
 */
export const StaticHandler = async (context: Context) => {
    //console.log(new URL(StaticAssets, import.meta.url).pathname)
    try {

        await context.send({
            root: new URL(StaticAssets, import.meta.url).pathname,
            index: "index.html",
        })
    } catch (e) {
        context.response.status = 404;
        context.response.body = "file not found"
        //console.log(e);
    }
}

export const OverlayHandler = async (context: Context) => {
    context.response.status = 200;
    context.response.body = JSON.stringify([])
}