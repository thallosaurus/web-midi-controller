import "./dialogs.css";

export const close_dialog = (id: string) => {
  console.log(id);
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

  const connect_button = document.querySelector<HTMLDivElement>("#disconnect-fallback .container button.primary")!
      connect_button.addEventListener("click", (e) => {
        //ConnectSocketEvent()
        /*initWebsocketWorkerWithOverlaySelection().then(() => {
          console.log("reconnect successful", e);
        });*/
        alert("not implemented yet")

        // construct new app state and enable it
      });
}