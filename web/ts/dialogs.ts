import "./ui/css/dialogs.css";

export const close_dialog = (id: string) => {
  const dialog = document.querySelector<HTMLDialogElement>("dialog#" + id)!;
  console.log(dialog);
  dialog.close("close");
};

export const open_dialog = (id: string) => {
  const dialog = document.querySelector<HTMLDialogElement>("dialog#" + id)!;
  dialog.showModal();
};

export const init_dialogs = () => {

  document.querySelectorAll<HTMLElement>("[data-dialog-trigger]").forEach(e => {  
    e.addEventListener("click", (f) => {
      let t = f.target as HTMLElement;
      console.log(t);
      //console.log(t.dataset.dialogTrigger);
      open_dialog(t.dataset.dialogTrigger!)
    })
  })

  document.querySelectorAll<HTMLElement>("[data-dialog-close]").forEach(e => {  
    e.addEventListener("click", (f) => {
      let t = f.target as HTMLElement;
      console.log(t);
      //console.log(t.dataset.dialogTrigger);
      close_dialog(t.dataset.dialogClose!)
    })
  })

    /*document.querySelector<HTMLButtonElement>(
        "dialog footer button[data-role='close']",
    )!.addEventListener("click", (_ev: MouseEvent) => {
        const target = (_ev.target! as HTMLButtonElement).dataset.target;
        close_dialog(target!);
    });*/
}