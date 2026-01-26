enum OrientationMode {
    Horizontal = "horizontal",
    Vertical = "vertical"
}
interface Overlay {
    mode: OrientationMode,
    layout: Layout
}

enum LayoutType {
    Grid = "grid",
    Flex = "flex"
}

interface Layout {
    type: LayoutType
    body: Array<Widget>
}

interface Flex extends Layout {
    cols: number,
    mode: OrientationMode,
}

enum WidgetType {
    CCSlider = "ccslider",
    CCButton = "ccbutton",
    NoteButton = "notebutton"
}

interface Widget {
    type: WidgetType
}

// WIDGETS

interface CCSliderDef extends Widget {
    channel: number,
    cc: number,
    mode: string
    label: string
    orientation: OrientationMode
}

enum CCButtonMode {
    Trigger = "trigger",
    Latch = "latch"
}

interface CCButtonDef extends Widget {
    channel: number,
    cc: number,
    value: number,
    value_off?: number,
    label: string,
    mode: CCButtonMode
}

interface NoteButtonDef extends Widget {
    channel: number,
    note: number,
    label: string
}

/*
export const Index: FC<{overlays: Array<Overlay>}> = (props: {
    overlays: Array<Overlay>
}) => {
    return <html lang="en">
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Web Midi Controller</title>
            <link rel="manifest" href="manifest.json" />
            <meta name="theme-color" content="#000000" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta content='width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=no;' name='viewport' />
            <meta name="viewport" content="width=device-width" minimum-scale="1" />
        </head>
        <body>
            <div id="app">

            <header>
                <div>
                    <h1>MIDI Control v0.1</h1>
                </div>
                <div id="menu_container">

                </div>
                <div id="overlay_selector">

                </div>
            </header>
            <main>
                <OverlayPage overlays={props.overlays}></OverlayPage>
            </main>
            <footer>
                <h2>Connection Status: <span id="connection_status">connecting...</span></h2>
            </footer>
            </div>
            <dialog id="menu">
                <header>
                    <h1>hello</h1>
                </header>
                <main>
                    <h1>main</h1>
                </main>
                <footer>
                    <button data-role="close" data-target="menu">Close</button>
                </footer>
            </dialog>
            <script type="module" src="/src/main.ts"></script>
        </body>
    </html>
}

export const OverlayPage: FC<{overlays: Array<Overlay>}> = (props: {
    overlays: Array<Overlay>
}) => {
    return <>{props.overlays.map((v, i) => {
        return <div key={i} className={v.mode + " overlay"}>
            {v.layout.body.map((w) => render_widget(w))}
        </div>
    })}</>
}*/

export async function get_custom_css(path: string): Promise<string> {
    try {
        const data = await Deno.readTextFile(path + "/css/custom.css");
        return data
    } catch (e) {
        return "/* no custom styles defined */";
    }
}

export async function load_overlays(path: string): Promise<Array<Overlay>> {
    const dirs = await Deno.readDir(path);
    const a = [];
    for await (const d of dirs) {
        //console.log(d);
        const ext = d.name.split(".").pop();
        if (d.isFile && ext === "json") {
            const data = Deno.readTextFileSync(path + "/" + d.name);
            a.push(JSON.parse(data) as Overlay);
        }
    }
    return a;
}
/*
function render_widget(widget: Widget) {
    switch (widget.type) {
        case WidgetType.CCSlider:
            {
                const w = widget as CCSliderDef;
                return <div className={w.type} data-channel={w.channel} data-cc={w.cc} data-mode={w.mode} data-vertical={w.mode} data-label={w.label}></div>
            }

        case WidgetType.CCButton:
            {
                const w = widget as CCButtonDef;
            }
        break;
        case WidgetType.NoteButton:
            {
                const w = widget as NoteButtonDef;
                return <div className={w.type} data-note={w.note} data-label={w.label}></div>
            }
    }
}*/