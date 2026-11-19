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

/** Reads the configured WebSocket endpoint or derives one from the current page. */
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

/** Returns the configured frontend version, or the default version string. */
export function getVersion() {
  return import.meta.env.VITE_VERSION ?? "0.0.0";
}
