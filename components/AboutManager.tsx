"use client";
import { useRef, useState, useEffect } from "react";
import { UploadCloud, BookText, Loader2 } from "lucide-react";

const MAX_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

export default function AboutManager({ onRefresh }: { onRefresh?: () => void }) {
  const [form, setForm] = useState<any>(null);
  const [storyPreview, setStoryPreview] = useState("");
  const [teamPreview, setTeamPreview] = useState("");
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [teamFile, setTeamFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const storyInput = useRef<HTMLInputElement>(null);
  const teamInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/about").then(r => r.json()).then(d => {
      const data = d || {};
      setForm({
        storyTitle: data.storyTitle || "Small ideas can become extraordinary moments.",
        storyText1: data.storyText1 || "Creative Corner brings together event planners, designers, coordinators and production partners to deliver celebrations and business events with confidence.",
        storyText2: data.storyText2 || "Our mission is simple: create meaningful experiences without putting the pressure of coordination on our clients.",
        storyImage: data.storyImage || "/images/about-story.svg",
        teamImage: data.teamImage || "/images/about-team.svg",
        mission: data.mission || "Deliver thoughtful, reliable and creative event experiences.",
        vision: data.vision || "Become the trusted event partner for celebrations and businesses.",
        whyUs: data.whyUs || "Transparent planning, professional teams and complete coordination.",
      });
      setStoryPreview(data.storyImage || "/images/about-story.svg");
      setTeamPreview(data.teamImage || "/images/about-team.svg");
    });
  }, []);

  function validate(f: File): string | null {
    if (!ALLOWED_TYPES.includes(f.type)) return `"${f.name}" supported format nahi hai (JPG, PNG, WEBP, GIF).`;
    if (f.size > MAX_SIZE) return `"${f.name}" 8MB se bari hai.`;
    return null;
  }

  function pickStory(e: any) {
    const f = e.target.files?.[0];
    if (!f) return;
    const v = validate(f);
    if (v) { setErr(v); return; }
    setErr("");
    setStoryFile(f);
    setStoryPreview(URL.createObjectURL(f));
  }

  function pickTeam(e: any) {
    const f = e.target.files?.[0];
    if (!f) return;
    const v = validate(f);
    if (v) { setErr(v); return; }
    setErr("");
    setTeamFile(f);
    setTeamPreview(URL.createObjectURL(f));
  }

  async function uploadOne(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    let payload: any = null;
    try { payload = await res.json(); } catch {}
    if (!res.ok) throw new Error(payload?.error || `Upload failed (status ${res.status}).`);
    if (!payload?.url) throw new Error("Server ne image URL wapis nahi bheja.");
    return payload.url as string;
  }

  async function save(e: any) {
    e.preventDefault();
    setMsg(""); setErr(""); setSaving(true);
    try {
      let storyImage = form.storyImage;
      let teamImage = form.teamImage;
      if (storyFile) { setProgress("Story image upload ho rahi hai..."); storyImage = await uploadOne(storyFile); }
      if (teamFile) { setProgress("Team image upload ho rahi hai..."); teamImage = await uploadOne(teamFile); }
      setProgress("Save ho raha hai...");
      const r = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, storyImage, teamImage }),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || "Save nahi ho saka.");
      const updated = await r.json();
      setForm(updated);
      setStoryPreview(updated.storyImage);
      setTeamPreview(updated.teamImage);
      setStoryFile(null);
      setTeamFile(null);
      setMsg("About page update ho gaya. Website par turant nazar aayega.");
      if (onRefresh) onRefresh();
    } catch (e: any) {
      setErr(e?.message || "Save nahi ho saka. Dobara koshish karein.");
    } finally {
      setSaving(false);
      setProgress("");
    }
  }

  if (!form) return <div className="admin-card empty">Loading about content...</div>;

  return (
    <div className="admin-card gallery-manager">
      <div className="gallery-manager-head">
        <div className="gallery-manager-head-icon"><BookText size={20} /></div>
        <div>
          <h3 style={{ margin: 0 }}>About Page Content</h3>
          <p className="muted" style={{ margin: "2px 0 0", fontSize: ".8rem" }}>Yahan se text aur images update karein — direct website par show hoga.</p>
        </div>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-error">{err}</div>}

      <form onSubmit={save} className="gallery-form">
        <div className="form-grid">
          <div className="field full">
            <label>Story Title</label>
            <input value={form.storyTitle} onChange={e => setForm({ ...form, storyTitle: e.target.value })} />
          </div>
          <div className="field full">
            <label>Story Paragraph 1</label>
            <textarea value={form.storyText1} onChange={e => setForm({ ...form, storyText1: e.target.value })} />
          </div>
          <div className="field full">
            <label>Story Paragraph 2</label>
            <textarea value={form.storyText2} onChange={e => setForm({ ...form, storyText2: e.target.value })} />
          </div>

          <div className="field">
            <label>Mission</label>
            <textarea value={form.mission} onChange={e => setForm({ ...form, mission: e.target.value })} />
          </div>
          <div className="field">
            <label>Vision</label>
            <textarea value={form.vision} onChange={e => setForm({ ...form, vision: e.target.value })} />
          </div>
          <div className="field full">
            <label>Why Us</label>
            <textarea value={form.whyUs} onChange={e => setForm({ ...form, whyUs: e.target.value })} />
          </div>

          <div className="field">
            <label>Story Image</label>
            <div className="dropzone" onClick={() => storyInput.current?.click()}>
              <UploadCloud size={22} />
              <p><b>Click karein</b> naye image ke liye</p>
              <input ref={storyInput} type="file" accept="image/*" onChange={pickStory} style={{ display: "none" }} />
            </div>
            {storyPreview && <div className="gallery-preview-wrap"><img src={storyPreview} alt="Story" className="gallery-preview" /></div>}
          </div>
          <div className="field">
            <label>Team / Planning Image</label>
            <div className="dropzone" onClick={() => teamInput.current?.click()}>
              <UploadCloud size={22} />
              <p><b>Click karein</b> naye image ke liye</p>
              <input ref={teamInput} type="file" accept="image/*" onChange={pickTeam} style={{ display: "none" }} />
            </div>
            {teamPreview && <div className="gallery-preview-wrap"><img src={teamPreview} alt="Team" className="gallery-preview" /></div>}
          </div>
        </div>

        <div style={{ marginTop: 15 }}>
          <button className="btn btn-primary" style={{ justifyContent: "center" }} disabled={saving}>
            {saving ? <><Loader2 size={16} className="spin" /> {progress || "Saving..."}</> : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
