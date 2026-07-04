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

export function getEndpointUrl() {
  let url;
  try {
    url = new URL(import.meta.env.VITE_BACKEND);
  } catch (e) {
    url = new URL("/ws", location.href);
    url.protocol = "ws";
  }
  return url;
}

export function getVersion() {
  return import.meta.env.VITE_VERSION ?? "0.0.0";
}