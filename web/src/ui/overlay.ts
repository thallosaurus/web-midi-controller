import "./overlay.css";

const overlay_emitter = new EventTarget();
const overlays: Array<HTMLDivElement> = [];
const hide_all_overlays = () => {
    overlays.map((v) => {
        if (!v.classList.contains("hide")) {
            v.classList.add("hide");
        }
    })
}
overlay_emitter.addEventListener("change", (ev: Event) => {
    hide_all_overlays();

    const e = ev as ChangeOverlayEvent;
    console.log(e.id);
    overlays[e.id].classList.remove("hide");
});

class ChangeOverlayEvent extends Event {
    id: number;
    constructor(new_id: number) {
        super("change");
        this.id = new_id;
    }
}

export const change_overlay = (overlayId: number) => {
    overlay_emitter.dispatchEvent(new ChangeOverlayEvent(overlayId));
}

export interface OverlayOptions {

}

export const setup_overlay = (
    parent: HTMLDivElement,
    //options: OverlayOptions,
) => {
    parent.classList.add("hide");

    overlays.push(parent);
};

export const setup_tabs = (parent: HTMLDivElement) => {
    parent.classList.add("tab_parent")
    for (let i = 0; i < overlays.length; i++) {
        const t = document.createElement("a");
        t.innerText = String(i);
        t.addEventListener("click", () => {
            change_overlay(i);
        })
        parent.appendChild(t)
    }
}