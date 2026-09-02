"use client";
import { useRef, useState } from "react";
import { UploadCloud, Sparkles, Pencil, Eye, EyeOff, Trash2, Loader2 } from "lucide-react";

const MAX_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function ServicesManager({ items, onRefresh }: { items: any[]; onRefresh?: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function pickFile(e: any) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) { setErr(`"${f.name}" supported format nahi hai (JPG, PNG, WEBP, GIF).`); return; }
    if (f.size > MAX_SIZE) { setErr(`"${f.name}" 8MB se bari hai.`); return; }
    setErr("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function uploadOne(f: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", f);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    let payload: any = null;
    try { payload = await res.json(); } catch {}
    if (!res.ok) throw new Error(payload?.error || `Upload failed (status ${res.status}).`);
    if (!payload?.url) throw new Error("Server ne image URL wapis nahi bheja.");
    return payload.url as string;
  }

  function resetForm() {
    setName(""); setDescription(""); setFeatures(""); setPrice(""); setImage(""); setFile(null); setPreview(""); setEditingId(null);
  }

  async function save(e: any) {
    e.preventDefault();
    setMsg(""); setErr("");
    if (!name.trim() || !description.trim() || !features.trim()) { setErr("Name, description aur features likhna zaroori hai."); return; }
    if (!editingId && !file) { setErr("Ek image select karein."); return; }

    setSaving(true);
    try {
      let img = image;
      if (file) { setProgress("Image upload ho rahi hai..."); img = await uploadOne(file); }

      if (editingId) {
        const r = await fetch("/api/content/services", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, name, description, features, price: price ? Number(price) : null, image: img }),
        });
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || "Update fail ho gaya.");
        setMsg("Service update ho gaya.");
      } else {
        const r = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, slug: slugify(name) + "-" + Date.now().toString(36), description, features, price: price ? Number(price) : null, image: img, active: true }),
        });
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || "Service save nahi hua.");
        setMsg("Naya service add ho gaya.");
      }
      resetForm();
      if (onRefresh) onRefresh();
    } catch (e: any) {
      setErr(e?.message || "Save nahi ho saka.");
    } finally {
      setSaving(false);
      setProgress("");
    }
  }

  function edit(item: any) {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description);
    setFeatures(item.features);
    setPrice(item.price ? String(item.price) : "");
    setImage(item.image);
    setPreview(item.image);
    setFile(null);
    setMsg(""); setErr("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggleActive(item: any) {
    await fetch("/api/content/services", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, active: !item.active }),
    });
    if (onRefresh) onRefresh();
  }

  async function remove(item: any) {
    if (!confirm(`"${item.name}" ko delete karna hai?`)) return;
    await fetch("/api/content/services", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id }),
    });
    if (onRefresh) onRefresh();
  }

  return (
    <div className="admin-card gallery-manager">
      <div className="gallery-manager-head">
        <div className="gallery-manager-head-icon"><Sparkles size={20} /></div>
        <div>
          <h3 style={{ margin: 0 }}>{editingId ? "Edit Service" : "Add New Service"}</h3>
          <p className="muted" style={{ margin: "2px 0 0", fontSize: ".8rem" }}>Yahan se jo image lagayenge wahi Services page par show hogi.</p>
        </div>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-error">{err}</div>}

      <form onSubmit={save} className="gallery-form">
        <div className="form-grid">
          <div className="field"><label>Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Wedding Planning" /></div>
          <div className="field"><label>Starting Price (PKR, optional)</label><input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="150000" /></div>
          <div className="field full"><label>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} /></div>
          <div className="field full"><label>Features (separate with |)</label><textarea value={features} onChange={e => setFeatures(e.target.value)} placeholder="Venue coordination|Theme & décor|Timeline management" /></div>

          <div className="field full">
            <label>Image</label>
            <div className="dropzone" onClick={() => inputRef.current?.click()}>
              <UploadCloud size={22} />
              <p><b>Click karein</b> image select karne ke liye</p>
              <span className="muted" style={{ fontSize: ".72rem" }}>JPG, PNG, WEBP, GIF · max 8MB</span>
              <input ref={inputRef} type="file" accept="image/*" onChange={pickFile} style={{ display: "none" }} />
            </div>
            {preview && <div className="gallery-preview-wrap"><img src={preview} alt="Preview" className="gallery-preview" /></div>}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
          <button className="btn btn-primary" style={{ justifyContent: "center" }} disabled={saving}>
            {saving ? <><Loader2 size={16} className="spin" /> {progress || "Saving..."}</> : editingId ? "Save Changes" : "Add Service"}
          </button>
          {editingId && <button type="button" className="btn btn-light" onClick={() => { resetForm(); setMsg(""); setErr(""); }} disabled={saving}>Cancel</button>}
        </div>
      </form>

      <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: "24px 0" }} />
      <h3>All Services ({items.length})</h3>
      {items.length ? (
        <div className="gallery-admin-grid">
          {items.map(s => (
            <div className="gallery-admin-card" key={s.id}>
              <div className="gallery-admin-img">
                <img src={s.image} alt={s.name} />
                {!s.active && <span className="gallery-hidden-badge">Inactive</span>}
              </div>
              <div className="gallery-admin-body">
                <b>{s.name}</b>
                {s.price && <span className="tag">PKR {Number(s.price).toLocaleString()}</span>}
              </div>
              <div className="gallery-admin-actions">
                <button className="btn btn-light btn-sm" onClick={() => edit(s)}><Pencil size={13} /> Edit</button>
                <button className="btn btn-light btn-sm" onClick={() => toggleActive(s)}>{s.active ? <><EyeOff size={13} /> Deactivate</> : <><Eye size={13} /> Activate</>}</button>
                <button className="btn btn-light btn-sm btn-danger" onClick={() => remove(s)}><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : <div className="empty">No services found.</div>}
    </div>
  );
}
