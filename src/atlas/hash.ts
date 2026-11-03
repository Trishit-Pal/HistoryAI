const PREFIX = "#model=";

/** The URL hash for a focused landmark, or "" to clear it. */
export function hashForModel(model: string | null): string {
  return model === null ? "" : `${PREFIX}${encodeURIComponent(model)}`;
}

/** The landmark named in a URL hash, if the hash is ours and well formed. */
export function modelFromHash(hash: string): string | undefined {
  if (!hash.startsWith(PREFIX)) return undefined;
  try {
    return decodeURIComponent(hash.slice(PREFIX.length)) || undefined;
  } catch {
    return undefined;
  }
}
