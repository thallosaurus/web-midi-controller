import { Overlay } from "@hdj/definitions";

export class OverlayManager {
  overlays: Overlay[] = []
  setOverlay: ((o: Overlay) => void) | null = null

  applyOverlays(o: Overlay[]) {
    this.overlays = o;
    if (this.overlays.length > 0) this.setByIndex(0);
  }
  clear() {
    this.overlays = [];
  }

  setByIndex(i: number) {
    if (!this.setOverlay) return;
    const o = this.overlays[i];
    if (o) {
      this.setOverlay(o);
    }
  }

  setByProgramId(n: number) {
    if (!this.setOverlay) return;

    const o = this.overlays.find((v, i) => {
      return v.program === n
    })
    console.log(this.overlays);
    if (o) this.setOverlay(o)
  }
}