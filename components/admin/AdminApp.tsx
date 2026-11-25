"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { addMonths, eachDayOfInterval, endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import {
  BedDouble, CalendarDays, ChevronLeft, ChevronRight, CircleDollarSign, CloudUpload, Eye, FileText,
  Gauge, ImageIcon, LayoutDashboard, LogOut, Menu, Pencil, Plus, Save, Search, Settings, Sparkles,
  X,
} from "lucide-react";
import type { Booking, Package, RateOverride, SiteContent } from "@/types";
import { defaultContent } from "@/data/defaults";

type Tab = "overview" | "bookings" | "calendar" | "rooms" | "content" | "media";
const formatNpr = (v: number) => `NPR ${new Intl.NumberFormat("en-NP").format(v)}`;

export default function AdminApp() {
  const [auth, setAuth] = useState<"checking" | "yes" | "no">("checking");
  useEffect(() => { fetch("/api/auth/session").then((r) => r.json()).then((d) => setAuth(d.authenticated ? "yes" : "no")).catch(() => setAuth("no")); }, []);
  if (auth === "checking") return <div className="admin-loading"><Image src="/brand/hotel-kausi-mark.svg" alt="" width={80} height={70} /><span>Preparing your dashboard…</span></div>;
  if (auth === "no") return <Login onSuccess={() => setAuth("yes")} />;
  return <Dashboard onLogout={() => setAuth("no")} />;
}

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), signal: controller.signal });
      const json = await res.json().catch(() => ({}));
      if (res.ok) onSuccess();
      else setError(json.error || "Login failed. Please check the deployment configuration.");
    } catch (requestError) {
      setError(requestError instanceof DOMException && requestError.name === "AbortError" ? "Login request timed out. Check MongoDB Atlas Network Access and Vercel environment variables." : "Could not reach the login service. Please try again.");
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  };
  return <main className="login-page"><div className="login-visual"><Image src="/images/hotel-exterior-night.jpg" fill alt="Hotel Kausi at night" sizes="60vw" priority /><div className="login-overlay" /><div className="login-quote"><p>“Hospitality lives in the details.”</p><span>HOTEL KAUSI · POKHARA</span></div></div><div className="login-panel"><div className="login-box"><Link className="admin-brand" href="/"><Image src="/brand/hotel-kausi-mark.svg" alt="" width={70} height={60} /><span><strong>Hotel Kausi</strong><small>PROPERTY MANAGEMENT</small></span></Link><p className="admin-kicker">Staff access</p><h1>Welcome back</h1><p className="login-intro">Sign in to manage reservations, rates, rooms and website content.</p><form onSubmit={submit}><label>Email address<input name="email" type="email" defaultValue="kausi@kritechsolution.com" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label>{error && <p className="login-error">{error}</p>}<button className="admin-primary" disabled={loading}>{loading ? "Signing in…" : "Sign in securely"}</button></form><p className="demo-hint"><Sparkles /> Authorized Hotel Kausi staff access only.</p><Link href="/" className="back-site">← Back to hotel website</Link></div></div></main>;
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("overview"); const [menu, setMenu] = useState(false); const [bookings, setBookings] = useState<Booking[]>([]); const [content, setContent] = useState<SiteContent>(defaultContent); const [rates, setRates] = useState<RateOverride[]>([]); const [demoMode, setDemoMode] = useState(false); const [toast, setToast] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([fetch("/api/bookings").then((x) => x.json()), fetch("/api/content").then((x) => x.json()), fetch("/api/rates").then((x) => x.json())])
      .then(([b, c, r]) => { if (!active) return; if (b.bookings) setBookings(b.bookings); if (c.payload) setContent(c.payload); if (r.rates) setRates(r.rates); setDemoMode(Boolean(b.demoMode || c.demoMode || r.demoMode)); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);
  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2800); };
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); onLogout(); };
  const nav: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard /> }, { id: "bookings", label: "Bookings", icon: <FileText /> }, { id: "calendar", label: "Rates & availability", icon: <CalendarDays /> }, { id: "rooms", label: "Room inventory", icon: <BedDouble /> }, { id: "content", label: "Website content", icon: <Pencil /> }, { id: "media", label: "Media library", icon: <ImageIcon /> },
  ];
  return <main className="admin-shell">
    <aside className={menu ? "admin-sidebar open" : "admin-sidebar"}><div className="sidebar-brand"><Image src="/brand/hotel-kausi-mark.svg" alt="" width={48} height={42} /><span><strong>Hotel Kausi</strong><small>PROPERTY OS</small></span><button onClick={() => setMenu(false)}><X /></button></div><nav>{nav.map((n) => <button key={n.id} className={tab === n.id ? "active" : ""} onClick={() => { setTab(n.id); setMenu(false); }}>{n.icon}{n.label}</button>)}</nav><div className="sidebar-bottom"><a href="/" target="_blank"><Eye /> View live website</a><button><Settings /> Settings</button><button onClick={logout}><LogOut /> Sign out</button></div></aside>
    <div className="admin-main"><header className="admin-topbar"><button className="admin-menu" onClick={() => setMenu(true)}><Menu /></button><div><span>Hotel operations</span>{demoMode && <b>Demo mode</b>}</div><div className="top-actions"><button><Search /></button><span className="admin-avatar">HK</span></div></header>
      <div className="admin-content">
        {tab === "overview" && <Overview bookings={bookings} content={content} setTab={setTab} />}
        {tab === "bookings" && <Bookings bookings={bookings} setBookings={setBookings} notify={notify} />}
        {tab === "calendar" && <RateCalendar content={content} rates={rates} setRates={setRates} notify={notify} />}
        {tab === "rooms" && <RoomsEditor content={content} setContent={setContent} notify={notify} />}
        {tab === "content" && <ContentEditor content={content} setContent={setContent} notify={notify} />}
        {tab === "media" && <MediaLibrary content={content} notify={notify} />}
      </div>
    </div>{toast && <div className="admin-toast"><Save /> {toast}</div>}
  </main>;
}

function PageTitle({ kicker, title, action }: { kicker: string; title: string; action?: React.ReactNode }) { return <div className="admin-title"><div><p>{kicker}</p><h1>{title}</h1></div>{action}</div>; }

function Overview({ bookings, content, setTab }: { bookings: Booking[]; content: SiteContent; setTab: (t: Tab) => void }) {
  const confirmed = bookings.filter((b) => b.status === "confirmed").length; const pending = bookings.filter((b) => b.status === "pending").length; const revenue = bookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + (b.total || 0), 0); const roomsAvailable = content.rooms.reduce((s, r) => s + r.availableRooms, 0);
  return <><PageTitle kicker={format(new Date(), "EEEE, d MMMM yyyy")} title="Good morning, Kausi team" action={<button className="admin-primary" onClick={() => setTab("bookings")}><Plus /> Add offline booking</button>} />
    <div className="metric-grid"><Metric icon={<CalendarDays />} label="Active bookings" value={String(confirmed)} note={`${pending} awaiting confirmation`} tone="green" /><Metric icon={<BedDouble />} label="Rooms available" value={String(roomsAvailable)} note={`Across ${content.rooms.length} categories`} tone="orange" /><Metric icon={<CircleDollarSign />} label="Booking value" value={formatNpr(revenue)} note="Current booking records" tone="navy" /><Metric icon={<Gauge />} label="Occupancy signal" value={`${Math.min(100, Math.round((confirmed / Math.max(1, content.rooms.reduce((s, r) => s + r.totalRooms, 0))) * 100))}%`} note="Based on confirmed stays" tone="purple" /></div>
    <div className="admin-two-col"><section className="admin-card"><div className="card-head"><div><span>Reservations</span><h2>Recent bookings</h2></div><button onClick={() => setTab("bookings")}>View all</button></div><div className="booking-list">{bookings.slice(0, 5).map((b) => <div key={b.id || b.reference}><span className="guest-initial">{b.guestName.charAt(0)}</span><div><strong>{b.guestName}</strong><small>{b.roomName || b.roomId}</small></div><div><strong>{format(new Date(`${b.checkIn}T12:00:00`), "d MMM")} – {format(new Date(`${b.checkOut}T12:00:00`), "d MMM")}</strong><small>{b.reference}</small></div><Status status={b.status || "pending"} /></div>)}</div></section><section className="admin-card"><div className="card-head"><div><span>Today</span><h2>Room snapshot</h2></div><button onClick={() => setTab("rooms")}>Manage</button></div><div className="inventory-list">{content.rooms.map((r) => <div key={r.id}><Image src={r.image} alt="" width={58} height={48} /><div><strong>{r.name}</strong><small>{r.availableRooms} of {r.totalRooms} available</small></div><div className="progress"><i style={{ width: `${(r.availableRooms / r.totalRooms) * 100}%` }} /></div><b>{formatNpr(r.price)}</b></div>)}</div></section></div>
  </>;
}
function Metric({ icon, label, value, note, tone }: { icon: React.ReactNode; label: string; value: string; note: string; tone: string }) { return <div className="metric-card"><span className={`metric-icon ${tone}`}>{icon}</span><p>{label}</p><strong>{value}</strong><small>{note}</small></div>; }
function Status({ status }: { status: string }) { return <span className={`status status-${status}`}>{status}</span>; }

function Bookings({ bookings, setBookings, notify }: { bookings: Booking[]; setBookings: (b: Booking[]) => void; notify: (s: string) => void }) {
  const [filter, setFilter] = useState("all"); const [query, setQuery] = useState(""); const [adding, setAdding] = useState(false);
  const visible = bookings.filter((b) => (filter === "all" || b.status === filter) && `${b.guestName} ${b.reference} ${b.phone}`.toLowerCase().includes(query.toLowerCase()));
  const update = async (b: Booking, status: Booking["status"]) => { const id = b.id || (b as { _id?: string })._id; if (!id) return; const res = await fetch(`/api/bookings/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }); if (res.ok) { setBookings(bookings.map((x) => x === b ? { ...x, status } : x)); notify(`Booking marked ${status}`); } };
  return <><PageTitle kicker="Reservations" title="Bookings" action={<button className="admin-primary" onClick={() => setAdding(!adding)}><Plus /> Offline booking</button>} />
    {adding && <OfflineBooking onClose={() => setAdding(false)} onSaved={(b) => { setBookings([b, ...bookings]); setAdding(false); notify("Offline booking added"); }} />}
    <section className="admin-card bookings-card"><div className="booking-tools"><div className="admin-search"><Search /><input placeholder="Search guest, phone or reference" value={query} onChange={(e) => setQuery(e.target.value)} /></div><select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All statuses</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="checked-in">Checked in</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div><div className="table-wrap"><table><thead><tr><th>Guest</th><th>Stay</th><th>Room</th><th>Source</th><th>Total</th><th>Status</th><th>Update</th></tr></thead><tbody>{visible.map((b) => <tr key={b.id || b.reference}><td><strong>{b.guestName}</strong><small>{b.reference}<br />{b.phone}</small></td><td>{format(new Date(`${b.checkIn}T12:00:00`), "d MMM yyyy")}<small>to {format(new Date(`${b.checkOut}T12:00:00`), "d MMM yyyy")}</small></td><td>{b.roomName || b.roomId}<small>{b.adults} adult{b.adults > 1 ? "s" : ""}{b.children ? `, ${b.children} child` : ""}</small></td><td className="capitalize">{b.source}</td><td>{formatNpr(b.total || 0)}</td><td><Status status={b.status || "pending"} /></td><td><select value={b.status} onChange={(e) => update(b, e.target.value as Booking["status"])}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="checked-in">Checked in</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></td></tr>)}</tbody></table></div></section></>;
}

function OfflineBooking({ onClose, onSaved }: { onClose: () => void; onSaved: (b: Booking) => void }) {
  const submit = async (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); const data = Object.fromEntries(new FormData(e.currentTarget)); const res = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, adults: Number(data.adults), children: 0, rooms: 1, source: "walk-in", status: "confirmed" }) }); const json = await res.json(); if (res.ok) onSaved(json.booking); };
  return <div className="inline-form admin-card"><div className="card-head"><div><span>Manual entry</span><h2>Add an offline booking</h2></div><button onClick={onClose}><X /></button></div><form onSubmit={submit}><input required name="guestName" placeholder="Guest name" /><input required name="phone" placeholder="Phone" /><input required type="email" name="email" placeholder="Email" /><select name="roomId">{defaultContent.rooms.map((r) => <option value={r.id} key={r.id}>{r.name}</option>)}</select><input required type="date" name="checkIn" /><input required type="date" name="checkOut" /><input type="number" min="1" defaultValue="2" name="adults" /><button className="admin-primary">Save booking</button></form></div>;
}

function RateCalendar({ content, rates, setRates, notify }: { content: SiteContent; rates: RateOverride[]; setRates: (r: RateOverride[]) => void; notify: (s: string) => void }) {
  const [month, setMonth] = useState(startOfMonth(new Date())); const [roomId, setRoomId] = useState(content.rooms[0].id); const [selected, setSelected] = useState<string | null>(null); const room = content.rooms.find((r) => r.id === roomId)!; const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) }); const blanks = Array.from({ length: startOfMonth(month).getDay() }); const override = selected ? rates.find((r) => r.date === selected && r.roomId === roomId) : undefined;
  const save = async (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); if (!selected) return; const data = Object.fromEntries(new FormData(e.currentTarget)); const rate: RateOverride = { date: selected, roomId, price: Number(data.price), availableRooms: Number(data.availableRooms), closed: data.closed === "on" }; const res = await fetch("/api/rates", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rate) }); if (res.ok) { setRates([...rates.filter((r) => !(r.date === selected && r.roomId === roomId)), rate]); setSelected(null); notify("Rate and availability updated"); } };
  return <><PageTitle kicker="Inventory control" title="Rates & availability" action={<select className="title-select" value={roomId} onChange={(e) => setRoomId(e.target.value)}>{content.rooms.map((r) => <option value={r.id} key={r.id}>{r.name}</option>)}</select>} />
    <div className="calendar-layout"><section className="admin-card calendar-card"><div className="calendar-head"><button onClick={() => setMonth(subMonths(month, 1))}><ChevronLeft /></button><div><span>Rate calendar</span><h2>{format(month, "MMMM yyyy")}</h2></div><button onClick={() => setMonth(addMonths(month, 1))}><ChevronRight /></button></div><div className="weekdays">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <span key={d}>{d}</span>)}</div><div className="calendar-grid">{blanks.map((_, i) => <i key={`b${i}`} />)}{days.map((d) => { const date = format(d, "yyyy-MM-dd"); const rate = rates.find((r) => r.date === date && r.roomId === roomId); return <button key={date} className={`${rate ? "has-rate" : ""} ${rate?.closed ? "closed" : ""}`} onClick={() => setSelected(date)}><span>{format(d, "d")}</span><strong>{rate?.closed ? "Closed" : formatNpr(rate?.price || room.price).replace("NPR ", "रु ")}</strong><small>{rate?.availableRooms ?? room.availableRooms} rooms</small></button>; })}</div></section><aside className="calendar-side admin-card"><h3>Quick controls</h3><p>Select any date to set a special rate, close sales, or adjust the available room count.</p><div className="calendar-legend"><span><i className="default" /> Standard rate</span><span><i className="override" /> Custom rate</span><span><i className="closed" /> Closed</span></div><div className="tip"><Sparkles /><div><strong>Offline booking?</strong><p>Reduce availability for its dates here after adding the booking.</p></div></div></aside></div>
    {selected && <div className="drawer-backdrop" onMouseDown={() => setSelected(null)}><form className="rate-drawer" onSubmit={save} onMouseDown={(e) => e.stopPropagation()}><button type="button" className="drawer-close" onClick={() => setSelected(null)}><X /></button><p className="admin-kicker">{format(new Date(`${selected}T12:00:00`), "EEEE")}</p><h2>{format(new Date(`${selected}T12:00:00`), "d MMMM yyyy")}</h2><p>{room.name}</p><label>Nightly rate (NPR)<input name="price" type="number" min="0" defaultValue={override?.price || room.price} /></label><label>Rooms available<input name="availableRooms" type="number" min="0" max={room.totalRooms} defaultValue={override?.availableRooms ?? room.availableRooms} /></label><label className="check-label"><input name="closed" type="checkbox" defaultChecked={override?.closed} /> Close this room type for online bookings</label><button className="admin-primary"><Save /> Save changes</button></form></div>}
  </>;
}

function RoomsEditor({ content, setContent, notify }: { content: SiteContent; setContent: (c: SiteContent) => void; notify: (s: string) => void }) {
  const saveRoom = async (id: string, fields: Partial<SiteContent["rooms"][number]>) => { const updated = { ...content, rooms: content.rooms.map((r) => r.id === id ? { ...r, ...fields } : r) }; const res = await fetch("/api/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) }); if (res.ok) { setContent(updated); notify("Room inventory updated"); } };
  return <><PageTitle kicker="Accommodation" title="Room inventory" action={<button className="admin-primary"><Plus /> Add room type</button>} /><div className="room-admin-grid">{content.rooms.map((r) => <article className="room-admin-card admin-card" key={r.id}><Image src={r.image} alt={r.name} width={420} height={230} /><div><span>{r.totalRooms} rooms total</span><h2>{r.name}</h2><p>{r.description}</p><div className="room-number-grid"><label>Base rate<input type="number" defaultValue={r.price} onBlur={(e) => saveRoom(r.id, { price: Number(e.target.value) })} /></label><label>Available now<input type="number" min="0" max={r.totalRooms} defaultValue={r.availableRooms} onBlur={(e) => saveRoom(r.id, { availableRooms: Number(e.target.value) })} /></label><label>Total rooms<input type="number" min="1" defaultValue={r.totalRooms} onBlur={(e) => saveRoom(r.id, { totalRooms: Number(e.target.value) })} /></label></div><button className="admin-secondary"><Pencil /> Edit details & amenities</button></div></article>)}</div></>;
}

function ContentEditor({ content, setContent, notify }: { content: SiteContent; setContent: (c: SiteContent) => void; notify: (s: string) => void }) {
  const [draft, setDraft] = useState<SiteContent>({
    ...content,
    contact: {
      ...content.contact,
      managementPhones: content.contact.managementPhones || defaultContent.contact.managementPhones,
      hotlinePhones: content.contact.hotlinePhones || defaultContent.contact.hotlinePhones,
    },
  });
  const save = async () => {
    const res = await fetch("/api/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
    if (res.ok) { setContent(draft); notify("Website content published"); }
    else notify("Could not publish website content");
  };
  const updatePackage = (index: number, fields: Partial<Package>) => setDraft((current) => ({
    ...current,
    packages: current.packages.map((pkg, i) => i === index ? { ...pkg, ...fields } : pkg),
  }));
  const addPackage = () => setDraft((current) => ({
    ...current,
    packages: [...current.packages, {
      id: `package-${Date.now()}`,
      title: "New Hotel Package",
      subtitle: "Describe the experience included in this package.",
      image: "/images/deluxe-double-balcony.jpg",
      priceLabel: "Custom quote",
      badge: "New offer",
      inclusions: ["Accommodation", "Daily breakfast"],
    }],
  }));
  const removePackage = (index: number) => setDraft((current) => ({ ...current, packages: current.packages.filter((_, i) => i !== index) }));
  const setPhoneList = (key: "managementPhones" | "hotlinePhones", value: string) => setDraft((current) => ({
    ...current,
    contact: { ...current.contact, [key]: value.split("\n").map((phone) => phone.trim()).filter(Boolean) },
  }));

  return <>
    <PageTitle kicker="Live website" title="Content editor" action={<div className="title-actions"><a className="admin-secondary" href="/" target="_blank"><Eye /> Preview</a><button className="admin-primary" onClick={save}><Save /> Publish changes</button></div>} />
    <div className="editor-layout">
      <section className="admin-card editor-card">
        <div className="editor-section"><span>Homepage hero</span><h2>First impression</h2><label>Eyebrow<input value={draft.hero.eyebrow} onChange={(e) => setDraft({ ...draft, hero: { ...draft.hero, eyebrow: e.target.value } })} /></label><label>Main headline<textarea rows={2} value={draft.hero.title} onChange={(e) => setDraft({ ...draft, hero: { ...draft.hero, title: e.target.value } })} /></label><label>Introduction<textarea rows={3} value={draft.hero.subtitle} onChange={(e) => setDraft({ ...draft, hero: { ...draft.hero, subtitle: e.target.value } })} /></label></div>
        <div className="editor-section"><span>About</span><h2>Hotel story</h2><label>Section title<input value={draft.about.title} onChange={(e) => setDraft({ ...draft, about: { ...draft.about, title: e.target.value } })} /></label><label>Description<textarea rows={5} value={draft.about.description} onChange={(e) => setDraft({ ...draft, about: { ...draft.about, description: e.target.value } })} /></label></div>
        <div className="editor-section"><span>Contact details</span><h2>How guests reach you</h2><label>Main hotline<input value={draft.contact.phone} onChange={(e) => setDraft({ ...draft, contact: { ...draft.contact, phone: e.target.value } })} /></label><label>Hotline & reception numbers — one per line<textarea rows={3} value={draft.contact.hotlinePhones.join("\n")} onChange={(e) => setPhoneList("hotlinePhones", e.target.value)} /></label><label>Management team numbers — one per line<textarea rows={4} value={draft.contact.managementPhones.join("\n")} onChange={(e) => setPhoneList("managementPhones", e.target.value)} /></label><label>Email<input value={draft.contact.email} onChange={(e) => setDraft({ ...draft, contact: { ...draft.contact, email: e.target.value } })} /></label><label>Address<textarea rows={3} value={draft.contact.address} onChange={(e) => setDraft({ ...draft, contact: { ...draft.contact, address: e.target.value } })} /></label></div>
      </section>
      <section className="admin-card editor-card">
        <div className="editor-section">
          <div className="editor-section-head"><div><span>Packages</span><h2>Offers & experiences</h2></div><button className="admin-secondary" onClick={addPackage}><Plus /> Add package</button></div>
          {draft.packages.map((pkg, index) => <div className="package-editor expanded" key={pkg.id}>
            <div className="package-preview"><Image src={pkg.image} alt="" width={120} height={100} /><button type="button" aria-label={`Remove ${pkg.title}`} onClick={() => removePackage(index)}><X /></button></div>
            <div>
              <label>Package title<input value={pkg.title} onChange={(e) => updatePackage(index, { title: e.target.value })} /></label>
              <label>Short description<textarea rows={2} value={pkg.subtitle} onChange={(e) => updatePackage(index, { subtitle: e.target.value })} /></label>
              <div className="package-field-row"><label>Badge<input value={pkg.badge || ""} onChange={(e) => updatePackage(index, { badge: e.target.value })} /></label><label>Price label<input value={pkg.priceLabel} onChange={(e) => updatePackage(index, { priceLabel: e.target.value })} /></label></div>
              <label>Image path or Cloudinary URL<input value={pkg.image} onChange={(e) => updatePackage(index, { image: e.target.value })} /></label>
              <label>Package inclusions — one per line<textarea rows={5} value={pkg.inclusions.join("\n")} onChange={(e) => updatePackage(index, { inclusions: e.target.value.split("\n").map((item) => item.trim()).filter(Boolean) })} /></label>
            </div>
          </div>)}
        </div>
      </section>
    </div>
  </>;
}

function MediaLibrary({ content, notify }: { content: SiteContent; notify: (s: string) => void }) {
  const images = useMemo(() => Array.from(new Set([content.hero.image, ...content.rooms.map((r) => r.image), ...content.packages.map((p) => p.image), "/images/restaurant.jpg", "/images/rooftop-event.jpg", "/images/nepali-thali.jpg", "/images/momo.jpg"])), [content]); const [uploads, setUploads] = useState<string[]>([]); const upload = async (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; const body = new FormData(); body.append("file", file); const res = await fetch("/api/upload", { method: "POST", body }); const json = await res.json(); if (res.ok) { setUploads([json.secure_url, ...uploads]); notify("Image uploaded to Cloudinary"); } else notify(json.error || "Upload failed"); };
  return <><PageTitle kicker="Assets" title="Media library" action={<label className="admin-primary upload-button"><CloudUpload /> Upload image<input type="file" accept="image/*" onChange={upload} /></label>} /><div className="media-note"><CloudUpload /><div><strong>Cloudinary-ready media management</strong><p>Add your credentials in <code>.env.local</code> to enable optimized cloud uploads. Existing hotel photography is already organized below.</p></div></div><div className="media-grid">{[...uploads, ...images].map((src, i) => <div key={`${src}-${i}`}><Image src={src} alt={`Hotel Kausi media ${i + 1}`} fill sizes="25vw" /><span>{src.split("/").pop()}</span><button><Pencil /></button></div>)}</div></>;
}
