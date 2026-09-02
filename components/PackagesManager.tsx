"use client";
import { useRef, useState } from "react";
import { UploadCloud, PackageOpen, Pencil, Eye, EyeOff, Trash2, Loader2 } from "lucide-react";

const MAX_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function PackagesManager({ items, onRefresh }: { items: any[]; onRefresh?: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [included, setIncluded] = useState("");
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
    setName(""); setDescription(""); setIncluded(""); setPrice(""); setImage(""); setFile(null); setPreview(""); setEditingId(null);
  }

  async function save(e: any) {
    e.preventDefault();
    setMsg(""); setErr("");
    if (!name.trim() || !description.trim() || !included.trim() || !price.trim()) { setErr("Name, description, included aur price zaroori hain."); return; }
    if (!editingId && !file) { setErr("Ek image select karein."); return; }

    setSaving(true);
    try {
      let img = image;
      if (file) { setProgress("Image upload ho rahi hai..."); img = await uploadOne(file); }

      if (editingId) {
        const r = await fetch("/api/content/packages", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, name, description, included, price: Number(price), image: img }),
        });
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || "Update fail ho gaya.");
        setMsg("Package update ho gaya.");
      } else {
        const r = await fetch("/api/packages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, slug: slugify(name) + "-" + Date.now().toString(36), description, included, price: Number(price), image: img, active: true }),
        });
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || "Package save nahi hua.");
        setMsg("Naya package add ho gaya.");
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
    setIncluded(item.included);
    setPrice(String(item.price));
    setImage(item.image);
    setPreview(item.image);
    setFile(null);
    setMsg(""); setErr("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggleActive(item: any) {
    await fetch("/api/content/packages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, active: !item.active }),
    });
    if (onRefresh) onRefresh();
  }

  async function remove(item: any) {
    if (!confirm(`"${item.name}" ko delete karna hai?`)) return;
    await fetch("/api/content/packages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id }),
    });
    if (onRefresh) onRefresh();
  }

  return (
    <div className="admin-card gallery-manager">
      <div className="gallery-manager-head">
        <div className="gallery-manager-head-icon"><PackageOpen size={20} /></div>
        <div>
          <h3 style={{ margin: 0 }}>{editingId ? "Edit Package" : "Add New Package"}</h3>
          <p className="muted" style={{ margin: "2px 0 0", fontSize: ".8rem" }}>Yahan se jo image lagayenge wahi Packages page par show hogi.</p>
        </div>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-error">{err}</div>}

      <form onSubmit={save} className="gallery-form">
        <div className="form-grid">
          <div className="field"><label>Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Premium Package" /></div>
          <div className="field"><label>Price (PKR)</label><input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="175000" /></div>
          <div className="field full"><label>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} /></div>
          <div className="field full"><label>Included (separate with |)</label><textarea value={included} onChange={e => setIncluded(e.target.value)} placeholder="Premium Decoration|Professional Lighting|Stage Setup" /></div>

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
            {saving ? <><Loader2 size={16} className="spin" /> {progress || "Saving..."}</> : editingId ? "Save Changes" : "Add Package"}
          </button>
          {editingId && <button type="button" className="btn btn-light" onClick={() => { resetForm(); setMsg(""); setErr(""); }} disabled={saving}>Cancel</button>}
        </div>
      </form>

      <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: "24px 0" }} />
      <h3>All Packages ({items.length})</h3>
      {items.length ? (
        <div className="gallery-admin-grid">
          {items.map(p => (
            <div className="gallery-admin-card" key={p.id}>
              <div className="gallery-admin-img">
                <img src={p.image} alt={p.name} />
                {!p.active && <span className="gallery-hidden-badge">Inactive</span>}
              </div>
              <div className="gallery-admin-body">
                <b>{p.name}</b>
                <span className="tag">PKR {Number(p.price).toLocaleString()}</span>
              </div>
              <div className="gallery-admin-actions">
                <button className="btn btn-light btn-sm" onClick={() => edit(p)}><Pencil size={13} /> Edit</button>
                <button className="btn btn-light btn-sm" onClick={() => toggleActive(p)}>{p.active ? <><EyeOff size={13} /> Deactivate</> : <><Eye size={13} /> Activate</>}</button>
                <button className="btn btn-light btn-sm btn-danger" onClick={() => remove(p)}><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : <div className="empty">No packages found.</div>}
    </div>
  );
}
