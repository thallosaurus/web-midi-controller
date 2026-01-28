
export function vibrate() {
  if (navigator.vibrate) {
    navigator.vibrate(20);
  }
}