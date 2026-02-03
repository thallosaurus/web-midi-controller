import { log } from "@common/logger";
import "./css/dialogs.css";
import "./css/overlay_menu.css"

export class UiDialog {
  static dialogs = new Map<string, UiDialog>();
  static currentDialogId: string | null = null
  constructor(private dialog: HTMLDialogElement) { }
  open() {
    this.dialog.showModal();
  }
  close(retValue?: string) {
    this.dialog.close(retValue);
  }

  static initDialogs() {
    for (const c of document.querySelectorAll<HTMLDialogElement>("dialog")) {
      this.dialogs.set(c.id, new UiDialog(c));
    }
    log(this.dialogs);
  }

  static openDialog(id: string) {
    const d = this.dialogs.get(id)!;
    d.open();
  }

  static closeDialog(id: string) {
    const d = this.dialogs.get(id)!;
    d.close()
  }

  static closeCurrentDialog() {
    const d = this.dialogs.get(this.currentDialogId!)!;
    d.close()
  }

  static initDialogTriggers() {
    document.querySelectorAll<HTMLElement>("[data-dialog-trigger]:not(.disabled)").forEach(el => {
      const id = el.dataset.dialogTrigger;

      if (!id || !this.dialogs.has(id!)) throw new Error("dialog with id " + " not found");

      el.addEventListener("click", (f) => {
        //console.log(t);
        //console.log(t.dataset.dialogTrigger);
        this.openDialog(id);
        this.currentDialogId = id;
      });

    })

    document.querySelectorAll<HTMLElement>("[data-dialog-close]").forEach(el => {
      const id = el.dataset.dialogClose;
      if (!id || !this.dialogs.has(id!)) throw new Error("dialog with id " + " not found");

      el.addEventListener("click", (f) => {
        let t = f.target as HTMLElement;
        console.log(t);
        //console.log(t.dataset.dialogTrigger);
        //close_dialog(t.dataset.dialogClose!)
        this.closeDialog(id);
        this.currentDialogId = null;
      })
    })
  }
}