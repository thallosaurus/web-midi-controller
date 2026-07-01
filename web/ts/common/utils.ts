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

export type Feature = "default" | "file";
export type FeatureSet = Set<Feature>;

export const hasFeature = (fs: FeatureSet, f: Feature) => {
  if (fs.size == 0 && f == "default") return true;
  fs.has(f);
}

export function resolveFeatures(): FeatureSet {
  const params = new URLSearchParams(location.search);

  const raw = params.get("features");
  const features = new Set<Feature>;

  if (!raw) return features;

  for (const f of raw.split(",")) {
    features.add(f.trim() as Feature);
  }

  if (features.size == 0) {
    features.add("default")
  }
  return features;
}

export function getHostFromQuery(): string | null {
  const params = new URLSearchParams(location.search);

  const raw = params.get("host");

  if (!raw) return null;

  const t = raw.trim();
  return t == "local" ? location.hostname : t;
}