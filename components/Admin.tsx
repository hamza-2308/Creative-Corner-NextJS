"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GalleryManager from "@/components/GalleryManager";
import ServiceManager from "@/components/ServiceManager";
import PackageManager from "@/components/PackageManager";
import EventManager from "@/components/EventManager";
import ServicesManager from "@/components/ServicesManager";
import PackagesManager from "@/components/PackagesManager";
import EventsManager from "@/components/EventsManager";
import AboutManager from "@/components/AboutManager";
import {
  LayoutDashboard, CalendarCheck2, Users, Sparkles, PackageOpen, PartyPopper,
  Images, MessageSquareText, Bell, Settings, LogOut, ExternalLink, Lock, Mail, BookText,
} from "lucide-react";

const nav = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "bookings", label: "Bookings", icon: CalendarCheck2 },
  { key: "clients", label: "Clients", icon: Users },
  { key: "about", label: "About Page", icon: BookText },
  { key: "services", label: "Services", icon: Sparkles },
  { key: "packages", label: "Packages", icon: PackageOpen },
  { key: "events", label: "Events", icon: PartyPopper },
  { key: "gallery", label: "Gallery", icon: Images },
  { key: "inquiries", label: "Inquiries", icon: MessageSquareText },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "settings", label: "Settings", icon: Settings },
];

function Shell({ children, tab }: { children: React.ReactNode; tab: string }) {
  const r = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    r.push("/admin/login");
  }
  return (
    <div className="admin-shell">
      <aside className="admin-nav">
        <div className="admin-nav-brand">
          <div className="logo">Creative <span>Corner</span></div>
          <p className="admin-nav-tag">ADMIN PANEL</p>
        </div>
        <nav className="admin-nav-links">
          {nav.map(({ key, label, icon: Icon }) => (
            <Link key={key} href={`/admin?tab=${key}`} className={tab === key ? "active" : ""}>
              <Icon size={17} /> <span>{label}</span>
            </Link>
          ))}
        </nav>
        <button onClick={logout} className="btn btn-light admin-logout">
          <LogOut size={15} /> Logout
        </button>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}

export function LoginForm() {
  const [email, setEmail] = useState("admin@creativecorner.pk");
  const [password, setPassword] = useState("Admin@123");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const r = useRouter();

  async function go(e: any) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const x = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (x.ok) r.push("/admin");
    else setErr((await x.json()).error);
  }

  return (
    <div className="login-card">
      <div className="login-icon"><Lock size={22} /></div>
      <div className="eyebrow">Creative Corner</div>
      <h1 className="serif" style={{ margin: "6px 0 22px" }}>Admin Login</h1>
      {err && <div className="alert alert-error">{err}</div>}
      <form onSubmit={go}>
        <div className="field">
          <label>Email</label>
          <div className="input-icon-wrap">
            <Mail size={15} />
            <input value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </div>
        <br />
        <div className="field">
          <label>Password</label>
          <div className="input-icon-wrap">
            <Lock size={15} />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
        </div>
        <br />
        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
      <p className="muted" style={{ fontSize: ".8rem", marginTop: 16 }}>Default: admin@creativecorner.pk / Admin@123</p>
    </div>
  );
}

export function AdminDashboard() {
  const [tab, setTab] = useState(
    typeof window !== "undefined" ? new URLSearchParams(location.search).get("tab") || "dashboard" : "dashboard"
  );
  const [data, setData] = useState<any>({
    bookings: [], clients: [], services: [], packages: [], events: [], gallery: [], inquiries: [],
  });
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(() => {
    setLoading(true);
    return Promise.all(
      ["bookings", "clients", "services", "packages", "events", "gallery", "inquiries"].map(x =>
        fetch("/api/" + x).then(z => z.json())
      )
    )
      .then(a =>
        setData({ bookings: a[0], clients: a[1], services: a[2], packages: a[3], events: a[4], gallery: a[5], inquiries: a[6] })
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    setTab(q.get("tab") || "dashboard");
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeof window !== "undefined" ? location.search : ""]);

  async function refreshGallery() {
    const g = await fetch("/api/gallery").then(z => z.json());
    setData((d: any) => ({ ...d, gallery: g }));
  }
  async function refreshServices() {
    const s = await fetch("/api/services").then(z => z.json());
    setData((d: any) => ({ ...d, services: s }));
  }
  async function refreshPackages() {
    const p = await fetch("/api/packages").then(z => z.json());
    setData((d: any) => ({ ...d, packages: p }));
  }
  async function refreshEvents() {
    const ev = await fetch("/api/events").then(z => z.json());
    setData((d: any) => ({ ...d, events: ev }));
  }

  const change = async (id: string, status: string) => {
    await fetch(`/api/bookings/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadAll();
  };

  const activeLabel = nav.find(n => n.key === tab)?.label || "Dashboard";

  return (
    <Shell tab={tab}>
      <div className="admin-top">
        <div>
          <div className="eyebrow">Creative Corner</div>
          <h1 className="serif" style={{ margin: "4px 0" }}>{activeLabel}</h1>
        </div>
        <Link href="/" target="_blank" className="btn btn-light">
          <ExternalLink size={15} /> View Website
        </Link>
      </div>

      {loading && !data.bookings.length && !data.gallery.length ? (
        <div className="admin-card empty">Loading dashboard...</div>
      ) : (
        <>
          {tab === "dashboard" && (
            <>
              <div className="admin-grid">
                {[
                  ["Total Bookings", data.bookings.length],
                  ["Pending", data.bookings.filter((x: any) => x.status === "PENDING").length],
                  ["Confirmed Events", data.bookings.filter((x: any) => x.status === "CONFIRMED").length],
                  ["Total Clients", data.clients.length],
                  ["Services", data.services.length],
                  ["Packages", data.packages.length],
                  ["Gallery Items", data.gallery.length],
                  ["Inquiries", data.inquiries.length],
                ].map(x => (
                  <div className="admin-card metric-card" key={x[0] as string}>
                    <span className="muted">{x[0] as string}</span>
                    <div className="metric">{x[1] as number}</div>
                  </div>
                ))}
              </div>
              <br />
              <div className="admin-card">
                <h3>Recent Bookings</h3>
                <TableBookings data={data.bookings.slice(0, 8)} onChange={change} />
              </div>
            </>
          )}
          {tab === "bookings" && (
            <div className="admin-card">
              <TableBookings data={data.bookings} onChange={change} />
            </div>
          )}
          {tab === "clients" && <SimpleTable title="Clients" rows={data.clients} cols={["name", "email", "phone", "createdAt"]} />}
          {tab === "services" && <ServiceManager items={data.services} onRefresh={refreshServices} />}
          {tab === "packages" && <PackageManager items={data.packages} onRefresh={refreshPackages} />}
          {tab === "events" && <EventManager items={data.events} onRefresh={refreshEvents} />}
          {tab === "gallery" && <GalleryManager items={data.gallery} onRefresh={refreshGallery} />}
          {tab === "inquiries" && <SimpleTable title="Contact Inquiries" rows={data.inquiries} cols={["name", "email", "subject", "status", "createdAt"]} />}
          {tab === "notifications" && (
            <div className="admin-card">
              <h3>Notifications</h3>
              <p>🔔 {data.bookings.filter((x: any) => x.status === "PENDING").length} pending booking request(s).</p>
              <p>✉ {data.inquiries.filter((x: any) => x.status === "NEW").length} new contact inquiry/inquiries.</p>
              <p>📅 Upcoming schedules can be reviewed in the Events and Bookings modules.</p>
            </div>
          )}
          {tab === "settings" && (
            <div className="admin-card">
              <h3>Settings</h3>
              <p className="muted">
                Admin authentication, environment configuration and website settings are documented in README.md.
                Change credentials through environment variables before production deployment.
              </p>
            </div>
          )}
        </>
      )}
    </Shell>
  );
}

function TableBookings({ data, onChange }: { data: any[]; onChange: any }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Reference</th><th>Client</th><th>Event</th><th>Date</th><th>Guests</th><th>Location</th><th>Status</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map(b => (
            <tr key={b.id}>
              <td><b>{b.reference}</b></td>
              <td>{b.client?.name}</td>
              <td>{b.eventType}<br /><small>{b.eventName}</small></td>
              <td>{new Date(b.eventDate).toLocaleDateString()}</td>
              <td>{b.guests}</td>
              <td>{b.city}</td>
              <td><span className={"status " + b.status}>{b.status.replaceAll("_", " ")}</span></td>
              <td>
                <select value={b.status} onChange={e => onChange(b.id, e.target.value)}>
                  <option>PENDING</option><option>UNDER_REVIEW</option><option>CONFIRMED</option>
                  <option>IN_PROGRESS</option><option>COMPLETED</option><option>CANCELLED</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!data.length && <div className="empty">No bookings found.</div>}
    </div>
  );
}

function SimpleTable({ title, rows, cols }: { title: string; rows: any[]; cols: string[] }) {
  return (
    <div className="admin-card">
      <h3>{title}</h3>
      <div className="table-wrap">
        <table className="table">
          <thead><tr>{cols.map(c => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                {cols.map(c => (
                  <td key={c}>
                    {typeof r[c] === "boolean" ? (r[c] ? "Yes" : "No") : c === "price" && r[c] ? `PKR ${Number(r[c]).toLocaleString()}` : String(r[c] ?? "").slice(0, 80)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <div className="empty">No records found.</div>}
      </div>
    </div>
  );
}
