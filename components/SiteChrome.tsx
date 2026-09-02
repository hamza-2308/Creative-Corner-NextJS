"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [open, setOpen] = useState(false);
  return <header className="nav"><div className="container nav-inner">
    <Link className="logo" href="/" onClick={() => setOpen(false)}>Creative <span>Corner</span></Link>
    <nav className="nav-links">
      <Link href="/about">About</Link><Link href="/services">Services</Link><Link href="/packages">Packages</Link>
      <Link href="/events">Events</Link><Link href="/gallery">Gallery</Link><Link href="/contact">Contact</Link>
      <Link className="btn btn-gold" href="/booking"><CalendarDays size={16}/> Book Event</Link>
    </nav>
    <div className="mobile-nav" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</div>
  </div>
  {open && (
    <div className="mobile-menu">
      <Link href="/about" onClick={() => setOpen(false)}>About</Link>
      <Link href="/services" onClick={() => setOpen(false)}>Services</Link>
      <Link href="/packages" onClick={() => setOpen(false)}>Packages</Link>
      <Link href="/events" onClick={() => setOpen(false)}>Events</Link>
      <Link href="/gallery" onClick={() => setOpen(false)}>Gallery</Link>
      <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
      <Link className="btn btn-gold" href="/booking" onClick={() => setOpen(false)}><CalendarDays size={16}/> Book Event</Link>
    </div>
  )}
  </header>
}

export function Footer() {
  return <footer className="footer"><div className="container footer-grid">
    <div><div className="logo">Creative <span>Corner</span></div><p className="muted">We turn special moments into unforgettable memories.</p></div>
    <div><b>Explore</b><Link href="/about">About Us</Link><Link href="/services">Services</Link><Link href="/packages">Packages</Link><Link href="/gallery">Gallery</Link></div>
    <div><b>Events</b><Link href="/events">Portfolio</Link><Link href="/booking">Book an Event</Link><Link href="/contact">Contact</Link></div>
    <div><b>Contact</b><p className="muted">Islamabad / Rawalpindi<br/>+92 300 1234567<br/>hello@creativecorner.pk</p></div>
  </div><div className="container" style={{borderTop:"1px solid #ffffff18",marginTop:35,paddingTop:18,color:"#aaa"}}>© {new Date().getFullYear()} Creative Corner. All rights reserved.</div></footer>
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  return (
    <>
      {!isAdmin && <Header />}
      {children}
      {!isAdmin && <Footer />}
    </>
  );
}