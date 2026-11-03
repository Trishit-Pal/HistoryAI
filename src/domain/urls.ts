const MAX_URL_LENGTH = 2048;

export function isHttpUrl(value: string): boolean {
  if (typeof value !== "string" || value.length === 0 || value.length > MAX_URL_LENGTH) return false;
  if (value !== value.trim()) return false;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    if (url.username !== "" || url.password !== "") return false;
    return true;
  } catch {
    return false;
  }
}

export function isMuseumAssetPath(value: string): boolean {
  if (typeof value !== "string") return false;
  if (!/^\/museum\/[A-Za-z0-9._/-]+$/.test(value)) return false;
  if (value.includes("..") || value.includes("//")) return false;
  return true;
}
