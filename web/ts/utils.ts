
export function vibrate() {
  if (navigator.vibrate) {
    navigator.vibrate(20);
  }
}

export function uuid(): string {
  if (crypto && crypto.randomUUID) {
    return crypto.randomUUID()
  } else {
    return pseudoUUID();
  }
}

function pseudoUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function init_debug() {
    window.addEventListener("error", e => {
      alert("error:" + e.message + e.filename + e.lineno);
    });
    window.addEventListener("unhandledrejection", e => {
      alert("promise error:" + e.reason);
    });
}