import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Clock3, Gem, Camera, Users } from "lucide-react";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [services, packages, gallery, events, aboutContent] = await Promise.all([
    db.service.findMany({where:{active:true},take:6}),
    db.package.findMany({where:{active:true},take:3}),
    db.galleryItem.findMany({where:{visible:true},take:6,orderBy:{createdAt:"desc"}}),
    db.event.findMany({where:{completed:true},take:3,orderBy:{date:"desc"}}),
    db.aboutContent.findUnique({where:{id:"about-content"}})
  ]);
  const storyImage = aboutContent?.storyImage || "/images/about-story.svg";
  return <>
    <section className="hero"><div className="hero-3d-bg">
      <div className="hero-3d-sphere s1" />
      <div className="hero-3d-sphere s2" />
      <div className="hero-3d-sphere s3" />
      <div className="hero-3d-ring r1" />
      <div className="hero-3d-ring r2" />
      <div className="hero-3d-cube c1" />
      <div className="hero-3d-cube c2" />
      <div className="hero-3d-pyramid p1" />
      <div className="hero-3d-pyramid p2" />
      <div className="hero-3d-diamond d1" />
      <div className="hero-3d-diamond d2" />
      <div className="hero-3d-sparkle" />
    </div><div className="container hero-inner">
      <div className="eyebrow">Creative Corner · Event Management</div>
      <h1>We turn your special moments into unforgettable memories.</h1>
      <p>Professional event planning and management for weddings, corporate events, parties, conferences and every celebration worth remembering.</p>
      <div className="hero-actions"><Link className="btn btn-gold" href="/booking">Book Your Event <ArrowRight size={17}/></Link><Link className="btn btn-gold" href="/gallery">Explore Our Work</Link></div>
    </div></section>

    <section className="section"><div className="container">
      <div className="section-head"><div><div className="eyebrow">What we do</div><h2>Events, beautifully handled.</h2></div><Link href="/services" className="btn btn-light">All Services <ArrowRight size={16}/></Link></div>
      <div className="grid grid-3">{services.map(s=><div className="card" key={s.id}><div className="image-box"><img src={s.image} alt={s.name}/></div><div className="card-body"><div className="service-icon"><Sparkles/></div><h3>{s.name}</h3><p className="muted">{s.description}</p><Link className="btn btn-light" href={`/booking?service=${s.id}`}>Book Now</Link></div></div>)}</div>
    </div></section>

    <section className="section" style={{background:"#fff"}}><div className="container about">
      <div className="about-art"><img src={storyImage} alt="Creative Corner event styling" /></div><div><div className="eyebrow">About Creative Corner</div><h2 className="serif" style={{fontSize:"clamp(2.2rem,4vw,3.8rem)"}}>From first idea to final applause.</h2><p className="muted" style={{lineHeight:1.9}}>We bring planning, creativity and professional coordination together so you can enjoy your event instead of managing it. Our team handles the details, vendors, schedules, production and guest experience.</p>
      <div className="stats"><div className="stat"><strong>8+</strong><span className="muted">Years experience</span></div><div className="stat"><strong>250+</strong><span className="muted">Events managed</span></div><div className="stat"><strong>98%</strong><span className="muted">Happy clients</span></div><div className="stat"><strong>24/7</strong><span className="muted">Event support</span></div></div>
      <br/><Link href="/about" className="btn btn-primary">Our Story <ArrowRight size={16}/></Link></div>
    </div></section>

    <section className="section"><div className="container"><div className="section-head"><div><div className="eyebrow">Packages</div><h2>Choose your level of celebration.</h2></div><Link href="/packages" className="btn btn-light">Compare Packages</Link></div>
      <div className="grid grid-3">{packages.map((p,i)=><div className={`card package-card ${i===1?"featured":""}`} key={p.id}><div className="image-box"><img src={p.image} alt={p.name}/></div><div className="card-body"><span className="tag">{i===1?"Most Popular":"Event Package"}</span><h3>{p.name}</h3><p className="muted">{p.description}</p><div className="price">PKR {p.price.toLocaleString()}</div><ul className="feature-list">{p.included.split("|").slice(0,5).map(x=><li key={x}>{x}</li>)}</ul><Link className="btn btn-primary" href={`/booking?package=${p.id}`}>Book This Package</Link></div></div>)}</div>
    </div></section>

    <section className="section" style={{background:"#211c29",color:"white"}}><div className="container"><div className="section-head"><div><div className="eyebrow">Why choose us</div><h2>Peace of mind is part of the package.</h2></div></div><div className="grid grid-4">
      {[["Experienced Event Planners",Users],["Professional Team",ShieldCheck],["Creative Decorations",Gem],["On-Time Management",Clock3]].map(([t,I])=><div key={t as string}><I/><h3>{t as string}</h3><p style={{color:"#bbb"}}>Thoughtful planning, clear communication and reliable execution.</p></div>)}</div></div></section>

    <section className="section"><div className="container"><div className="section-head"><div><div className="eyebrow">Portfolio</div><h2>Moments we've made.</h2></div><Link href="/events" className="btn btn-light">View Events</Link></div><div className="grid grid-3">{events.map(e=><div className="card" key={e.id}><div className="image-box"><img src={e.images} alt={e.name}/></div><div className="card-body"><span className="tag">{e.type}</span><h3>{e.name}</h3><p className="muted">{e.location} · {e.date.toLocaleDateString()}</p><p className="muted">{e.description}</p></div></div>)}</div></div></section>

    <section className="section" style={{background:"#f1e5df"}}><div className="container"><div className="section-head"><div><div className="eyebrow">Gallery</div><h2>A little inspiration.</h2></div><Link href="/gallery" className="btn btn-primary">Open Gallery</Link></div><div className="gallery">{gallery.map(g=><div className="gallery-item" key={g.id}><img src={g.image} alt={g.title}/><div className="gallery-caption"><b>{g.title}</b><br/><small>{g.category}</small></div></div>)}</div></div></section>

    <section className="section"><div className="container" style={{textAlign:"center"}}><Camera size={34}/><div className="eyebrow">Let's plan it</div><h2 className="serif" style={{fontSize:"clamp(2.4rem,5vw,4.5rem)"}}>Your next unforgettable event starts here.</h2><Link className="btn btn-gold" href="/booking">Start Booking <ArrowRight size={17}/></Link></div></section>
  </>
}