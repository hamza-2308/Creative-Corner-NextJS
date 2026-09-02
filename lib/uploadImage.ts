export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  let payload: any = null;
  try {
    payload = await res.json();
  } catch {
    /* non-json response */
  }
  if (!res.ok) {
    throw new Error(payload?.error || `Upload failed (status ${res.status}).`);
  }
  if (!payload?.url) throw new Error("Server ne image URL wapis nahi bheja.");
  return payload.url as string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
