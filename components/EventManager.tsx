"use client";
import { useRef, useState } from "react";
import { UploadCloud, PartyPopper, Pencil, Eye, EyeOff, Trash2, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/uploadImage";

const types = ["Wedding", "Corporate", "Birthday", "Engagement", "Conference", "Other"];

export default function EventManager({ items, onRefresh }: { items: any[]; onRefresh?: () => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [services, setServices] = useState("");
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
    setName(""); setType(""); setDate(""); setLocation(""); setDescription(""); setServices("");
    setImage(""); setFile(null); setPreview(""); setEditingId(null);
  }

  async function save(e: any) {
    e.preventDefault();
    setMsg(""); setErr("");
    if (!name.trim() || !type.trim() || !date.trim() || !location.trim() || !description.trim()) {
      setErr("Name, type, date, location aur description zaroori hain.");
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
        type,
        date: new Date(date).toISOString(),
        location,
        description,
        services: services.split("\n").map(s => s.trim()).filter(Boolean).join("|"),
        images: img,
      };

      if (editingId) {
        const r = await fetch("/api/content/events", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...body }),
        });
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || "Update fail ho gaya.");
        setMsg("Event update ho gaya.");
      } else {
        const r = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, completed: true }),
        });
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || "Event save nahi hua.");
        setMsg("Event add ho gaya.");
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
    setType(item.type);
    setDate(new Date(item.date).toISOString().slice(0, 10));
    setLocation(item.location);
    setDescription(item.description);
    setServices((item.services || "").split("|").join("\n"));
    setImage(item.images);
    setFile(null); setPreview("");
    setMsg(""); setErr("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggleCompleted(item: any) {
    await fetch("/api/content/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, completed: !item.completed }),
    });
    onRefresh?.();
  }

  async function remove(item: any) {
    if (!confirm(`"${item.name}" delete karna hai?`)) return;
    const r = await fetch("/api/content/events", {
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
        <div className="gallery-manager-head-icon"><PartyPopper size={20} /></div>
        <div>
          <h3 style={{ margin: 0 }}>{editingId ? "Edit Event" : "Add New Event"}</h3>
          <p className="muted" style={{ margin: "2px 0 0", fontSize: ".8rem" }}>Website ke Events/Portfolio page par foran show hoga.</p>
        </div>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-error">{err}</div>}

      <form onSubmit={save} className="gallery-form">
        <div className="form-grid">
          <div className="field">
            <label>Event Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Luxury Wedding – Islamabad" />
          </div>
          <div className="field">
            <label>Type</label>
            <select value={type} onChange={e => setType(e.target.value)}>
              <option value="">Select type</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Location</label>
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Islamabad" />
          </div>
          <div className="field full">
            <label>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description" />
          </div>
          <div className="field full">
            <label>Services Used (har line ek service)</label>
            <textarea value={services} onChange={e => setServices(e.target.value)} placeholder={"Wedding Planning\nDecoration Services\nPhotography"} style={{ minHeight: 90 }} />
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
            {saving ? <><Loader2 size={16} className="spin" /> Saving...</> : editingId ? "Save Changes" : "Add Event"}
          </button>
          {editingId && <button type="button" className="btn btn-light" onClick={resetForm} disabled={saving}>Cancel</button>}
        </div>
      </form>

      <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: "24px 0" }} />
      <h3>All Events ({items.length})</h3>
      {items.length ? (
        <div className="gallery-admin-grid">
          {items.map(ev => (
            <div className="gallery-admin-card" key={ev.id}>
              <div className="gallery-admin-img">
                <img src={ev.images} alt={ev.name} />
                {!ev.completed && <span className="gallery-hidden-badge">Not shown</span>}
              </div>
              <div className="gallery-admin-body">
                <b>{ev.name}</b>
                <span className="tag">{ev.type} · {new Date(ev.date).toLocaleDateString()}</span>
              </div>
              <div className="gallery-admin-actions">
                <button className="btn btn-light btn-sm" onClick={() => edit(ev)}><Pencil size={13} /> Edit</button>
                <button className="btn btn-light btn-sm" onClick={() => toggleCompleted(ev)}>
                  {ev.completed ? <><EyeOff size={13} /> Hide</> : <><Eye size={13} /> Show</>}
                </button>
                <button className="btn btn-light btn-sm btn-danger" onClick={() => remove(ev)}><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : <div className="empty">No events yet.</div>}
    </div>
  );
}
