"use client";
import { useRef, useState } from "react";
import { UploadCloud, ImagePlus, Pencil, Eye, EyeOff, Trash2, X, Loader2 } from "lucide-react";

const cats = ["Weddings", "Birthdays", "Corporate Events", "Engagements", "Conferences", "Decorations", "Other"];
const MAX_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

type PendingFile = { file: File; preview: string };

export default function GalleryManager({ items, onRefresh }: { items: any[]; onRefresh?: () => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function validateFile(f: File): string | null {
    if (!ALLOWED_TYPES.includes(f.type)) return `"${f.name}" ek supported image format nahi hai. Sirf JPG, PNG, WEBP ya GIF allowed hai.`;
    if (f.size > MAX_SIZE) return `"${f.name}" 8MB se bari hai.`;
    return null;
  }

  function addFiles(list: FileList | File[]) {
    setErr("");
    const arr = Array.from(list);
    const valid: PendingFile[] = [];
    for (const f of arr) {
      const v = validateFile(f);
      if (v) { setErr(v); continue; }
      valid.push({ file: f, preview: URL.createObjectURL(f) });
    }
    if (!valid.length) return;
    // Editing mode only supports a single image
    if (editingId) {
      setFiles([valid[0]]);
      setImage("");
    } else {
      setFiles(prev => [...prev, ...valid]);
    }
  }

  function pickFiles(e: any) {
    const list = e.target.files;
    if (list && list.length) addFiles(list);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removePending(idx: number) {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }

  async function uploadOne(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    let payload: any = null;
    try { payload = await res.json(); } catch { /* non-json response */ }
    if (!res.ok) {
      throw new Error(payload?.error || `Upload failed (status ${res.status}). Server console check karein.`);
    }
    if (!payload?.url) throw new Error("Server ne image URL wapis nahi bheja.");
    return payload.url as string;
  }

  async function save(e: any) {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (!title.trim() || !category.trim()) {
      setErr("Title aur category likhna zaroori hai.");
      return;
    }
    if (!editingId && !files.length) {
      setErr("Kam az kam ek image select karein.");
      return;
    }
    if (editingId && !files.length && !image) {
      setErr("Image select karein ya purani image rehne dein.");
      return;
    }

    setUploading(true);
    try {
      if (editingId) {
        let img = image;
        if (files.length) {
          setUploadProgress("Image upload ho rahi hai...");
          img = await uploadOne(files[0].file);
        }
        const r = await fetch("/api/content/gallery", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, title, category, description, image: img }),
        });
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || "Update fail ho gaya.");
        setMsg("Gallery item update ho gaya.");
      } else {
        // Upload all selected files, one gallery item per image
        let done = 0;
        for (const pf of files) {
          setUploadProgress(`Upload ho raha hai ${done + 1} / ${files.length}...`);
          const url = await uploadOne(pf.file);
          const itemTitle = files.length > 1 ? `${title} ${done + 1}` : title;
          const res = await fetch("/api/gallery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: itemTitle, category, description, image: url, visible: true }),
          });
          if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Gallery item save nahi hua.");
          done++;
        }
        setMsg(files.length > 1 ? `${done} images gallery mein add ho gayi.` : "Gallery item add ho gaya.");
      }

      resetForm();
      if (onRefresh) onRefresh();
      else setTimeout(() => location.reload(), 700);
    } catch (e: any) {
      setErr(e?.message || "Save nahi ho saka. Dobara koshish karein.");
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  }

  function resetForm() {
    setTitle("");
    setCategory("");
    setDescription("");
    setImage("");
    setFiles([]);
    setEditingId(null);
  }

  function edit(item: any) {
    setEditingId(item.id);
    setTitle(item.title);
    setCategory(item.category);
    setDescription(item.description || "");
    setImage(item.image);
    setFiles([]);
    setMsg("");
    setErr("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    resetForm();
    setMsg("");
    setErr("");
  }

  async function toggleVisible(item: any) {
    await fetch("/api/content/gallery", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, visible: !item.visible }),
    });
    if (onRefresh) onRefresh();
    else location.reload();
  }

  async function remove(item: any) {
    if (!confirm(`"${item.title}" ko gallery se delete karna hai?`)) return;
    await fetch("/api/content/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id }),
    });
    if (onRefresh) onRefresh();
    else location.reload();
  }

  return (
    <div className="admin-card gallery-manager">
      <div className="gallery-manager-head">
        <div className="gallery-manager-head-icon"><ImagePlus size={20} /></div>
        <div>
          <h3 style={{ margin: 0 }}>{editingId ? "Edit Gallery Item" : "Add New Gallery Item"}</h3>
          <p className="muted" style={{ margin: "2px 0 0", fontSize: ".8rem" }}>
            {editingId ? "Image aur details update karein." : "Ek ya multiple images ek sath upload karein."}
          </p>
        </div>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-error">{err}</div>}

      <form onSubmit={save} className="gallery-form">
        <div className="form-grid">
          <div className="field">
            <label>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Golden Wedding Night" />
          </div>
          <div className="field">
            <label>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">Select category</option>
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field full">
            <label>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description (optional)" />
          </div>

          <div className="field full">
            <label>{editingId ? "Replace Image (optional)" : "Images"}</label>
            <div
              className={`dropzone${dragOver ? " dropzone-active" : ""}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
            >
              <UploadCloud size={26} />
              <p><b>Click karein</b> ya images yahan drag & drop karein</p>
              <span className="muted" style={{ fontSize: ".72rem" }}>JPG, PNG, WEBP, GIF · max 8MB per image{!editingId && " · multiple select ho sakti hain"}</span>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple={!editingId}
                onChange={pickFiles}
                style={{ display: "none" }}
              />
            </div>

            {editingId && image && !files.length && (
              <p className="muted" style={{ fontSize: ".75rem", marginTop: 8 }}>Current image will be kept unless you select a new one.</p>
            )}

            {!!files.length && (
              <div className="pending-grid">
                {files.map((pf, i) => (
                  <div className="pending-thumb" key={i}>
                    <img src={pf.preview} alt={pf.file.name} />
                    <button type="button" className="pending-remove" onClick={() => removePending(i)}><X size={13} /></button>
                    <span className="pending-name">{pf.file.name}</span>
                  </div>
                ))}
              </div>
            )}

            {editingId && image && !files.length && (
              <div className="gallery-preview-wrap">
                <img src={image} alt="Current" className="gallery-preview" />
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 15, alignItems: "center" }}>
          <button className="btn btn-primary" style={{ justifyContent: "center" }} disabled={uploading}>
            {uploading ? <><Loader2 size={16} className="spin" /> {uploadProgress || "Saving..."}</> : editingId ? "Save Changes" : `Add ${files.length > 1 ? `${files.length} Images` : "to Gallery"}`}
          </button>
          {editingId && (
            <button type="button" className="btn btn-light" onClick={cancelEdit} disabled={uploading}>Cancel</button>
          )}
        </div>
      </form>

      <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: "24px 0" }} />
      <h3>All Gallery Items ({items.length})</h3>
      {items.length ? (
        <div className="gallery-admin-grid">
          {items.map(g => (
            <div className="gallery-admin-card" key={g.id}>
              <div className="gallery-admin-img">
                <img src={g.image} alt={g.title} />
                {!g.visible && <span className="gallery-hidden-badge">Hidden</span>}
              </div>
              <div className="gallery-admin-body">
                <b>{g.title}</b>
                <span className="tag">{g.category}</span>
                {g.description && <p className="muted" style={{ fontSize: ".75rem", margin: "6px 0 0" }}>{g.description}</p>}
              </div>
              <div className="gallery-admin-actions">
                <button className="btn btn-light btn-sm" onClick={() => edit(g)}><Pencil size={13} /> Edit</button>
                <button className="btn btn-light btn-sm" onClick={() => toggleVisible(g)}>
                  {g.visible ? <><EyeOff size={13} /> Hide</> : <><Eye size={13} /> Show</>}
                </button>
                <button className="btn btn-light btn-sm btn-danger" onClick={() => remove(g)}><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty">No gallery items found.</div>
      )}
    </div>
  );
}
