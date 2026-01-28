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
    document.querySelector<HTMLButtonElement>(
        "dialog footer button[data-role='close']",
    )!.addEventListener("click", (_ev: MouseEvent) => {
        const target = (_ev.target! as HTMLButtonElement).dataset.target;
        close_dialog(target!);
    });
}