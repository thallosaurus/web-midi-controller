import { log } from "@common/logger";
import "./css/dialogs.css";
import "./css/overlay_menu.css"

export class UiDialog {
  static dialogs = new Map<string, UiDialog>();
  constructor(private dialog: HTMLDialogElement) {
    //const d = document.querySelector<HTMLDialogElement>("dialog#" + id);
    /*     if (d) {
      this.#dialog = d
      } else {
        throw new Error("Dialog not found")
    } */
  }
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

  static initDialogTriggers() {
    document.querySelectorAll<HTMLElement>("[data-dialog-trigger]:not(.disabled)").forEach(el => {
      const id = el.dataset.dialogTrigger;

      if (!id || !this.dialogs.has(id!)) throw new Error("dialog with id " + " not found");
      
      el.addEventListener("click", (f) => {
        //console.log(t);
        //console.log(t.dataset.dialogTrigger);
        const d = this.dialogs.get(id)!;
        d.open();
        //open_dialog(t.dataset!)
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
        const d = this.dialogs.get(id)!;
        d.close()
      })
    })
  }
}

const close_dialog = (id: string) => {
  console.log(id);
  const dialog = document.querySelector<HTMLDialogElement>("dialog#" + id)!;
  console.log(dialog);
  dialog.close("close");
};

const init_dialogs = () => {

  document.querySelectorAll<HTMLElement>("[data-dialog-trigger]").forEach(e => {
    e.addEventListener("click", (f) => {
      let t = f.target as HTMLElement;
      console.log(t);
      //console.log(t.dataset.dialogTrigger);
      //open_dialog(t.dataset.dialogTrigger!)
    })
  })

  document.querySelectorAll<HTMLElement>("[data-dialog-close]").forEach(e => {
    e.addEventListener("click", (f) => {
      let t = f.target as HTMLElement;
      console.log(t);
      //console.log(t.dataset.dialogTrigger);
      //close_dialog(t.dataset.dialogClose!)
    })
  })
}