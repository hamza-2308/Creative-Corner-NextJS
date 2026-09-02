"use client";
import { useRef, useState } from "react";
import { UploadCloud, PackageOpen, Pencil, Eye, EyeOff, Trash2, Loader2 } from "lucide-react";
import { uploadImage, slugify } from "@/lib/uploadImage";

export default function PackageManager({ items, onRefresh }: { items: any[]; onRefresh?: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [included, setIncluded] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function pick(f: File | undefined) {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function resetForm() {
    setName(""); setDescription(""); setIncluded(""); setPrice("");
    setImage(""); setFile(null); setPreview(""); setEditingId(null);
  }

  async function save(e: any) {
    e.preventDefault();
    setMsg(""); setErr("");
    if (!name.trim() || !description.trim() || !included.trim() || !price.trim()) {
      setErr("Name, description, included items aur price zaroori hain.");
      return;
    }
    if (!editingId && !file) {
      setErr("Ek image select karein.");
      return;
    }
    setSaving(true);
    try {
      let img = image;
      if (file) img = await uploadImage(file);

      const body: any = {
        name,
        description,
        included: included.split("\n").map(s => s.trim()).filter(Boolean).join("|"),
        price: Number(price),
        image: img,
      };

      if (editingId) {
        const r = await fetch("/api/content/packages", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...body }),
        });
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || "Update fail ho gaya.");
        setMsg("Package update ho gaya.");
      } else {
        const r = await fetch("/api/packages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, slug: slugify(name) + "-" + Date.now().toString(36), active: true }),
        });
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || "Package save nahi hua.");
        setMsg("Package add ho gaya.");
      }
      resetForm();
      onRefresh?.();
    } catch (e: any) {
      setErr(e?.message || "Save nahi ho saka.");
    } finally {
      setSaving(false);
    }
  }

  function edit(item: any) {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description);
    setIncluded((item.included || "").split("|").join("\n"));
    setPrice(String(item.price));
    setImage(item.image);
    setFile(null); setPreview("");
    setMsg(""); setErr("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggleActive(item: any) {
    await fetch("/api/content/packages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, active: !item.active }),
    });
    onRefresh?.();
  }

  async function remove(item: any) {
    if (!confirm(`"${item.name}" delete karna hai?`)) return;
    const r = await fetch("/api/content/packages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      alert(j?.error || "Delete nahi ho saka. Ho sakta hai ye kisi booking se linked ho.");
      return;
    }
    onRefresh?.();
  }

  return (
    <div className="admin-card gallery-manager">
      <div className="gallery-manager-head">
        <div className="gallery-manager-head-icon"><PackageOpen size={20} /></div>
        <div>
          <h3 style={{ margin: 0 }}>{editingId ? "Edit Package" : "Add New Package"}</h3>
          <p className="muted" style={{ margin: "2px 0 0", fontSize: ".8rem" }}>Website ke Packages page par foran show hoga.</p>
        </div>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-error">{err}</div>}

      <form onSubmit={save} className="gallery-form">
        <div className="form-grid">
          <div className="field">
            <label>Package Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Premium Package" />
          </div>
          <div className="field">
            <label>Price (PKR)</label>
            <input value={price} onChange={e => setPrice(e.target.value.replace(/[^0-9]/g, ""))} placeholder="e.g. 175000" />
          </div>
          <div className="field full">
            <label>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description" />
          </div>
          <div className="field full">
            <label>Included Items (har line ek item)</label>
            <textarea value={included} onChange={e => setIncluded(e.target.value)} placeholder={"Premium Decoration\nProfessional Lighting\nStage Setup"} style={{ minHeight: 90 }} />
          </div>
          <div className="field full">
            <label>{editingId ? "Replace Image (optional)" : "Image"}</label>
            <div className={`dropzone${dragOver ? " dropzone-active" : ""}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); pick(e.dataTransfer.files?.[0]); }}
              onClick={() => inputRef.current?.click()}>
              <UploadCloud size={26} />
              <p><b>Click karein</b> ya image yahan drag & drop karein</p>
              <span className="muted" style={{ fontSize: ".72rem" }}>JPG, PNG, WEBP, GIF · max 8MB</span>
              <input ref={inputRef} type="file" accept="image/*" onChange={e => pick(e.target.files?.[0])} style={{ display: "none" }} />
            </div>
            {(preview || image) && (
              <div className="gallery-preview-wrap">
                <img src={preview || image} alt="Preview" className="gallery-preview" />
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
          <button className="btn btn-primary" style={{ justifyContent: "center" }} disabled={saving}>
            {saving ? <><Loader2 size={16} className="spin" /> Saving...</> : editingId ? "Save Changes" : "Add Package"}
          </button>
          {editingId && <button type="button" className="btn btn-light" onClick={resetForm} disabled={saving}>Cancel</button>}
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
                <button className="btn btn-light btn-sm" onClick={() => toggleActive(p)}>
                  {p.active ? <><EyeOff size={13} /> Deactivate</> : <><Eye size={13} /> Activate</>}
                </button>
                <button className="btn btn-light btn-sm btn-danger" onClick={() => remove(p)}><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : <div className="empty">No packages yet.</div>}
    </div>
  );
}
