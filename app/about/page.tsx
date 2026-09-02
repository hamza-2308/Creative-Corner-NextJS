import { db } from "@/lib/db";

const defaults = {
  storyTitle: "Small ideas can become extraordinary moments.",
  storyText1: "Creative Corner brings together event planners, designers, coordinators and production partners to deliver celebrations and business events with confidence.",
  storyText2: "Our mission is simple: create meaningful experiences without putting the pressure of coordination on our clients.",
  storyImage: "/images/about-story.svg",
  teamImage: "/images/about-team.svg",
  mission: "Deliver thoughtful, reliable and creative event experiences.",
  vision: "Become the trusted event partner for celebrations and businesses.",
  whyUs: "Transparent planning, professional teams and complete coordination.",
};

export default async function About() {
  const c = (await db.aboutContent.findUnique({ where: { id: "about-content" } })) || defaults;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">About Creative Corner</div>
          <h1>We make the details feel effortless.</h1>
          <p style={{ maxWidth: 650, lineHeight: 1.8 }}>
            A professional event management company built around creativity, reliability and unforgettable guest experiences.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container about">
          <div>
            <div className="eyebrow">Our Story</div>
            <h2 className="serif" style={{ fontSize: "3.2rem" }}>{c.storyTitle}</h2>
            <p className="muted" style={{ lineHeight: 1.9 }}>{c.storyText1}</p>
            <p className="muted" style={{ lineHeight: 1.9 }}>{c.storyText2}</p>
          </div>
          <div className="about-art">
            <img src={c.storyImage} alt="Creative Corner event styling" />
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "#fff" }}>
        <div className="container grid grid-3">
          <div className="card card-body">
            <h3>Mission</h3>
            <p className="muted">{c.mission}</p>
          </div>
          <div className="card card-body">
            <h3>Vision</h3>
            <p className="muted">{c.vision}</p>
          </div>
          <div className="card card-body">
            <h3>Why us</h3>
            <p className="muted">{c.whyUs}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container about-team-wrap">
          <img src={c.teamImage} alt="Creative Corner planning team" className="about-team-img" />
        </div>
      </section>
    </>
  );
}
