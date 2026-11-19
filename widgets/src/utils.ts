/** Requests a short device vibration when the browser supports it. */
export function vibrate() {
  if (navigator.vibrate) {
    navigator.vibrate(20);
  }
}
/** Creates a UUID using the browser API, with a local fallback. */
export function uuid(): string {
  if (crypto && crypto.randomUUID) {
    return crypto.randomUUID()
  } else {
    return pseudoUUID();
  }
}

/** Generates a UUID-shaped identifier using random hexadecimal digits. */
function pseudoUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
