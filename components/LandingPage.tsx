"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  BedDouble,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Facebook,
  Instagram,
  MapPin,
  Menu,
  Mountain,
  Phone,
  Plane,
  Quote,
  Sparkles,
  Star,
  Trees,
  Users,
  Wifi,
  X,
} from "lucide-react";
import type { SiteContent } from "@/types";

const formatNpr = (value: number) => new Intl.NumberFormat("en-NP").format(value);
const today = new Date().toISOString().slice(0, 10);

export default function LandingPage({ initialContent }: { initialContent: SiteContent }) {
  const [content, setContent] = useState(initialContent);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(initialContent.rooms[0].id);

  useEffect(() => {
    fetch("/api/content")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data?.payload && setContent(data.payload))
      .catch(() => undefined);
  }, []);

  const openBooking = (roomId?: string) => {
    if (roomId) setSelectedRoom(roomId);
    setBookingOpen(true);
  };

  return (
    <main>
      <header className="site-header">
        <a href="#home" className="brand" aria-label="Hotel Kausi home">
          <Image src="/brand/hotel-kausi-mark.svg" alt="" width={48} height={42} priority />
          <span><strong>Hotel Kausi</strong><small>POKHARA · NEPAL</small></span>
        </a>
        <nav className={menuOpen ? "nav-links open" : "nav-links"} aria-label="Main navigation">
          <a href="#story" onClick={() => setMenuOpen(false)}>Our story</a>
          <a href="#rooms" onClick={() => setMenuOpen(false)}>Rooms</a>
          <a href="#dining" onClick={() => setMenuOpen(false)}>Dining</a>
          <a href="#experiences" onClick={() => setMenuOpen(false)}>Experiences</a>
          <a href="#location" onClick={() => setMenuOpen(false)}>Location</a>
        </nav>
        <div className="header-actions">
          <a className="phone-link" href={`tel:${content.contact.phone.replace(/[^+\d]/g, "")}`}><Phone size={16} /> {content.contact.phone}</a>
          <button className="button button-dark" onClick={() => openBooking()}>Reserve your stay</button>
          <button className="menu-button" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      <section id="home" className="hero">
        <Image src={content.hero.image} alt="Hotel Kausi illuminated at dusk" fill priority sizes="100vw" className="hero-image" />
        <div className="hero-shade" />
        <div className="hero-content page-shell">
          <p className="eyebrow light">{content.hero.eyebrow}</p>
          <h1>{content.hero.title}</h1>
          <p className="hero-copy">{content.hero.subtitle}</p>
          <div className="hero-actions">
            <button className="button button-copper" onClick={() => openBooking()}>Check availability</button>
            <a href="#rooms" className="text-link light-link">Explore our rooms <ArrowDown size={16} /></a>
          </div>
        </div>
        <div className="hero-note"><MapPin size={16} /><span>Lakeside-6, Pokhara<br /><small>Minutes from Phewa Lake</small></span></div>
      </section>

      <QuickBook rooms={content.rooms} selectedRoom={selectedRoom} setSelectedRoom={setSelectedRoom} onBook={() => openBooking()} />

      <section id="story" className="story section page-shell">
        <div className="story-copy reveal">
          <p className="eyebrow">{content.about.eyebrow}</p>
          <h2>{content.about.title}</h2>
          <p className="lead">{content.about.description}</p>
          <div className="service-grid">
            <div><Clock3 /><span><strong>Always here</strong><small>24-hour front desk</small></span></div>
            <div><Plane /><span><strong>Easy arrivals</strong><small>Airport transfers</small></span></div>
            <div><Wifi /><span><strong>Stay connected</strong><small>Complimentary Wi-Fi</small></span></div>
            <div><Trees /><span><strong>Room to breathe</strong><small>Garden & terraces</small></span></div>
          </div>
        </div>
        <div className="story-visual">
          <div className="image-frame main-frame"><Image src="/images/balcony-view.jpg" alt="Private balcony overlooking green hills" fill sizes="(max-width: 900px) 100vw, 42vw" /></div>
          <div className="image-frame inset-frame"><Image src="/images/hotel-entrance-night.jpg" alt="Hotel Kausi courtyard entrance at night" fill sizes="220px" /></div>
          <div className="story-seal"><Image src="/brand/hotel-kausi-mark.svg" alt="" width={58} height={50} /><span>FOUR-STAR<br />BOUTIQUE STAY</span></div>
        </div>
      </section>

      <section id="rooms" className="rooms-section section">
        <div className="page-shell">
          <div className="section-heading split-heading">
            <div><p className="eyebrow">Rooms & suites</p><h2>A room for every way you travel</h2></div>
            <p>Thoughtful comforts, generous layouts and views that keep Pokhara close—even when you choose to stay in.</p>
          </div>
          <div className="room-grid">
            {content.rooms.map((room) => (
              <article className="room-card" key={room.id}>
                <div className="room-image">
                  <Image src={room.image} alt={room.name} fill sizes="(max-width: 800px) 100vw, 33vw" />
                  {room.featured && <span className="image-badge"><Star size={13} fill="currentColor" /> Most loved</span>}
                  <span className="availability"><i /> {room.availableRooms} available</span>
                </div>
                <div className="room-body">
                  <div className="room-title-row"><h3>{room.name}</h3><span><small>from</small>NPR {formatNpr(room.price)}</span></div>
                  <p>{room.description}</p>
                  <div className="room-meta"><span><Users /> Up to {room.capacity}</span><span><BedDouble /> {room.beds}</span><span><Mountain /> {room.size}</span></div>
                  <div className="room-footer"><button className="text-link" onClick={() => openBooking(room.id)}>View & book</button><span>per night · taxes extra</span></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="dining" className="dining section page-shell">
        <div className="dining-gallery">
          <div className="dining-main"><Image src="/images/restaurant.jpg" alt="Hotel Kausi restaurant" fill sizes="55vw" /></div>
          <div className="dining-food"><Image src="/images/nepali-thali.jpg" alt="Traditional Nepali thali" fill sizes="30vw" /></div>
        </div>
        <div className="dining-copy">
          <p className="eyebrow">From our kitchen</p>
          <h2>Pokhara on your plate</h2>
          <p className="lead">Begin with a leisurely breakfast, share Nepali favourites at lunch, and settle in for dinner after a day by the lake.</p>
          <ul className="feature-list">
            <li><Check /> Breakfast, brunch, lunch & dinner</li>
            <li><Check /> Nepali, Asian and international choices</li>
            <li><Check /> Vegetarian options available</li>
            <li><Check /> Room service for quiet evenings in</li>
          </ul>
          <a href={`tel:${content.contact.phone.replace(/\s/g, "")}`} className="button button-outline">Reserve a table</a>
        </div>
      </section>

      <section id="experiences" className="packages-section section">
        <div className="page-shell">
          <div className="section-heading centered"><p className="eyebrow">Curated stays</p><h2>More than a room</h2><p>Make the occasion yours with thoughtful packages tailored by our team.</p></div>
          <div className="package-grid">
            {content.packages.map((pkg) => (
              <article className="package-card" key={pkg.id}>
                <div className="package-image"><Image src={pkg.image} alt={pkg.title} fill sizes="(max-width: 800px) 100vw, 33vw" /><span>{pkg.badge}</span></div>
                <div className="package-body"><h3>{pkg.title}</h3><p>{pkg.subtitle}</p><ul>{pkg.inclusions.map((item) => <li key={item}><Check /> {item}</li>)}</ul><div><strong>{pkg.priceLabel}</strong><button className="text-link" onClick={() => openBooking()}>Enquire now</button></div></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="quote-section">
        <Image src="/images/premium-twin-balcony.jpg" alt="Premium twin room at Hotel Kausi" fill sizes="100vw" />
        <div className="quote-overlay" />
        <div className="quote-card"><Quote /><p>“Quiet, comfortable and wonderfully close to the life of Lakeside.”</p><div className="stars">{Array.from({ length: 5 }).map((_, i) => <Star key={i} fill="currentColor" />)}</div><small>THE KAUSI EXPERIENCE</small></div>
      </section>

      <section className="gallery-section section page-shell">
        <div className="section-heading split-heading"><div><p className="eyebrow">A glimpse of Kausi</p><h2>Your Pokhara story starts here</h2></div><a href="https://www.facebook.com/hotelkausi" target="_blank" rel="noreferrer" className="text-link">See more on Facebook</a></div>
        <div className="gallery-grid">
          <div className="g-wide"><Image src="/images/rooftop-event.jpg" alt="Rooftop event overlooking the hills" fill sizes="50vw" /></div>
          <div><Image src="/images/momo.jpg" alt="Fresh Nepali momo" fill sizes="25vw" /></div>
          <div><Image src="/images/bathroom-suite.jpg" alt="Spacious en-suite bathroom" fill sizes="25vw" /></div>
          <div className="g-tall"><Image src="/images/family-room.jpg" alt="Family room" fill sizes="25vw" /></div>
          <div className="g-wide"><Image src="/images/hotel-exterior-night.jpg" alt="Hotel Kausi exterior" fill sizes="50vw" /></div>
        </div>
      </section>

      <section id="location" className="location-section">
        <div className="location-copy">
          <p className="eyebrow">At the heart of Lakeside</p>
          <h2>Close to everything.<br />Calm when you return.</h2>
          <p>{content.contact.address}</p>
          <div className="distance-list"><span><strong>4 min</strong> walk to Phewa Lake</span><span><strong>10 min</strong> walk to Ratna Mandir</span><span><strong>1 km</strong> from Pokhara Airport</span></div>
          <a href="https://maps.app.goo.gl/bf15znZyYU6oipjN6" target="_blank" rel="noreferrer" className="button button-copper">Open in Google Maps</a>
        </div>
        <div className="map-art" aria-label="Stylized map showing Hotel Kausi near Phewa Lake"><div className="lake-shape" /><div className="map-roads" /><div className="map-pin"><MapPin fill="currentColor" /><span>HOTEL KAUSI<small>Lakeside-6</small></span></div><span className="lake-label">PHEWA LAKE</span></div>
      </section>

      <section className="final-cta">
        <div><p className="eyebrow light">Your room in Pokhara is waiting</p><h2>Stay close to what matters.</h2><p>Book direct for personal assistance and the most flexible available options.</p></div>
        <button className="button button-copper" onClick={() => openBooking()}>Reserve your stay</button>
      </section>

      <footer>
        <div className="footer-main page-shell">
          <div className="footer-brand"><Image src="/brand/hotel-kausi-mark.svg" alt="" width={80} height={68} /><h3>Hotel Kausi</h3><p>A modern boutique experience in the heart of Pokhara Lakeside.</p><div className="socials"><a href="https://www.facebook.com/hotelkausi" aria-label="Facebook"><Facebook /></a><a href="#" aria-label="Instagram"><Instagram /></a></div></div>
          <div><h4>Explore</h4><a href="#story">Our story</a><a href="#rooms">Rooms</a><a href="#dining">Dining</a><a href="#experiences">Packages</a></div>
          <div><h4>Guest services</h4><a href="#rooms">Book a room</a><a href="#location">Directions</a><a href={`tel:${content.contact.phone}`}>Airport transfer</a><a href={`mailto:${content.contact.email}`}>Contact us</a></div>
          <div className="footer-contact">
            <h4>Find us</h4><p>{content.contact.address}</p>
            <h4>Hotline & reception</h4>
            {(content.contact.hotlinePhones || [content.contact.phone, content.contact.altPhone]).map((phone) => <a key={phone} href={`tel:${phone.replace(/[^+\d]/g, "")}`}>{phone}</a>)}
            <h4>Management team</h4>
            {(content.contact.managementPhones || ["+977 985-1129254", "+977 985-6026510", "+977 985-6061823"]).map((phone) => <a key={phone} href={`tel:${phone.replace(/[^+\d]/g, "")}`}>{phone}</a>)}
            <a href={`mailto:${content.contact.email}`}>{content.contact.email}</a>
          </div>
        </div>
        <div className="footer-bottom page-shell"><span>© {new Date().getFullYear()} Hotel Kausi. All rights reserved.</span><span>A modern boutique experience · Pokhara, Nepal</span><a href="/admin">Staff login</a></div>
      </footer>

      {bookingOpen && <BookingModal content={content} roomId={selectedRoom} onClose={() => setBookingOpen(false)} />}
    </main>
  );
}

function QuickBook({ rooms, selectedRoom, setSelectedRoom, onBook }: { rooms: SiteContent["rooms"]; selectedRoom: string; setSelectedRoom: (v: string) => void; onBook: () => void }) {
  const [checkIn, setCheckIn] = useState(today);
  const tomorrow = useMemo(() => { const d = new Date(`${checkIn}T12:00:00`); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); }, [checkIn]);
  const [checkOut, setCheckOut] = useState(tomorrow);
  return <div className="quick-book page-shell">
    <label><span>Check in</span><div><CalendarDays /><input type="date" min={today} value={checkIn} onChange={(e) => { const next = e.target.value; setCheckIn(next); const minOut = new Date(`${next}T12:00:00`); minOut.setDate(minOut.getDate() + 1); const nextOut = minOut.toISOString().slice(0, 10); if (checkOut <= next) setCheckOut(nextOut); }} /></div></label>
    <label><span>Check out</span><div><CalendarDays /><input type="date" min={tomorrow} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} /></div></label>
    <label><span>Room</span><div><BedDouble /><select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>{rooms.map((r) => <option value={r.id} key={r.id}>{r.name}</option>)}</select><ChevronDown /></div></label>
    <label><span>Guests</span><div><Users /><select defaultValue="2"><option value="1">1 guest</option><option value="2">2 guests</option><option value="3">3 guests</option><option value="4">4 guests</option></select><ChevronDown /></div></label>
    <button className="button button-copper" onClick={onBook}>Find a room</button>
  </div>;
}

function BookingModal({ content, roomId, onClose }: { content: SiteContent; roomId: string; onClose: () => void }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [checkIn, setCheckIn] = useState(today);
  const tomorrow = useMemo(() => { const d = new Date(`${checkIn}T12:00:00`); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); }, [checkIn]);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setStatus("loading");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, adults: Number(data.adults), children: Number(data.children), rooms: 1, source: "website" }) });
      const json = await res.json(); if (!res.ok) throw new Error(json.error || "Could not send booking request");
      setStatus("success"); setMessage(`Request received. Your reference is ${json.booking.reference}. Our team will contact you shortly.`);
    } catch (err) { setStatus("error"); setMessage(err instanceof Error ? err.message : "Something went wrong"); }
  };
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title" onMouseDown={(e) => e.stopPropagation()}>
    <button className="modal-close" onClick={onClose} aria-label="Close booking form"><X /></button>
    <div className="modal-aside"><Image src="/images/deluxe-double-balcony.jpg" alt="Deluxe room" fill sizes="35vw" /><div><Sparkles /><p>Book direct</p><span>Personal assistance from our Pokhara reservations team.</span></div></div>
    <div className="modal-form"><p className="eyebrow">Plan your stay</p><h2 id="booking-title">Request a reservation</h2>
      {status === "success" ? <div className="success-state"><div><Check /></div><h3>Thank you</h3><p>{message}</p><button className="button button-dark" onClick={onClose}>Done</button></div> : <form onSubmit={submit}>
        <div className="form-row"><label>Check in<input required name="checkIn" type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} /></label><label>Check out<input required name="checkOut" type="date" min={tomorrow} defaultValue={tomorrow} /></label></div>
        <label>Room type<select name="roomId" defaultValue={roomId}>{content.rooms.map((r) => <option value={r.id} key={r.id}>{r.name} — NPR {formatNpr(r.price)}</option>)}</select></label>
        <div className="form-row"><label>Adults<select name="adults" defaultValue="2"><option>1</option><option>2</option><option>3</option><option>4</option></select></label><label>Children<select name="children" defaultValue="0"><option>0</option><option>1</option><option>2</option><option>3</option></select></label></div>
        <label>Full name<input required name="guestName" placeholder="Your name" /></label>
        <div className="form-row"><label>Email<input required name="email" type="email" placeholder="you@example.com" /></label><label>Phone<input required name="phone" type="tel" placeholder="+977…" /></label></div>
        <label>Special requests<textarea name="specialRequests" placeholder="Airport pickup, dietary needs, celebration…" rows={3} /></label>
        {status === "error" && <p className="form-error">{message}</p>}
        <button className="button button-copper full-button" disabled={status === "loading"}>{status === "loading" ? "Sending…" : "Request reservation"}</button>
        <small className="form-note">This is a reservation request. Your stay is confirmed after our team contacts you.</small>
      </form>}
    </div>
  </div></div>;
}
