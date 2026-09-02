import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const services = [
  ["Wedding Planning","wedding-planning","Full-service wedding planning from concept to final guest departure.","Venue coordination|Theme & décor|Timeline management|Vendor coordination",150000,"/images/wedding.svg"],
  ["Birthday Events","birthday-events","Memorable birthday experiences designed around your personality and theme.","Theme design|Décor|Entertainment coordination|On-site management",45000,"/images/birthday.svg"],
  ["Corporate Events","corporate-events","Professional conferences, launches, dinners and corporate celebrations.","Stage setup|Branding|AV coordination|Guest management",100000,"/images/corporate.svg"],
  ["Engagement Events","engagement-events","Elegant engagement planning with refined décor and smooth coordination.","Décor|Lighting|Stage|Event coordination",70000,"/images/engagement.svg"],
  ["Conference Management","conference-management","End-to-end conference planning for productive, polished business events.","Registration|Seating|AV|Speaker coordination",120000,"/images/conference.svg"],
  ["Decoration Services","decoration-services","Creative décor concepts that transform venues into beautiful experiences.","Floral design|Backdrop|Tablescapes|Lighting",50000,"/images/decor.svg"],
  ["Catering","catering","Curated menus and professional catering coordination for every event size.","Menu planning|Service staff|Presentation|Dietary coordination",1800,"/images/catering.svg"],
  ["Photography","photography","Professional event photography to preserve the moments that matter.","Candid coverage|Portraits|Editing|Online gallery",35000,"/images/photo.svg"]
];

const packages = [
  ["Basic Package","basic","A practical package for intimate celebrations and simple gatherings.","Event Decoration|Basic Lighting|Seating Arrangement|Basic Management",75000,"/images/basic.svg"],
  ["Premium Package","premium","A polished experience with enhanced production and dedicated coordination.","Premium Decoration|Professional Lighting|Stage Setup|Seating Arrangement|Event Coordination",175000,"/images/premium.svg"],
  ["Luxury Package","luxury","Complete event production for clients who want a truly elevated experience.","Complete Event Planning|Premium Decoration|Stage & Lighting|Catering Coordination|Photography|Professional Event Management",350000,"/images/luxury.svg"]
];

const gallery = [
  ["Golden Wedding Night","Weddings","/images/wedding.svg","Luxury wedding décor and warm evening lighting."],
  ["Corporate Summit","Corporate Events","/images/corporate.svg","Professional conference staging and guest experience."],
  ["Birthday Garden","Birthdays","/images/birthday.svg","Colorful outdoor birthday celebration."],
  ["Engagement Elegance","Engagements","/images/engagement.svg","Elegant stage and floral styling."],
  ["Conference Stage","Conferences","/images/conference.svg","Modern stage, lighting and presentation setup."],
  ["Royal Décor","Decorations","/images/decor.svg","Statement décor and premium tablescape."]
];

async function main() {
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@123", 12);
  await prisma.admin.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@creativecorner.pk" },
    update: { passwordHash },
    create: { name: "Creative Corner Admin", email: process.env.ADMIN_EMAIL || "admin@creativecorner.pk", passwordHash }
  });

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s[1] as string },
      update: {},
      create: { name:s[0] as string, slug:s[1] as string, description:s[2] as string, features:s[3] as string, price:s[4] as number, image:s[5] as string }
    });
  }
  for (const p of packages) {
    await prisma.package.upsert({
      where: { slug: p[1] as string },
      update: {},
      create: { name:p[0] as string, slug:p[1] as string, description:p[2] as string, included:p[3] as string, price:p[4] as number, image:p[5] as string }
    });
  }
  for (const g of gallery) {
    const exists = await prisma.galleryItem.findFirst({ where: { title: g[0] as string } });
    if (!exists) await prisma.galleryItem.create({ data: { title:g[0] as string, category:g[1] as string, image:g[2] as string, description:g[3] as string } });
  }

  const events = [
    ["Luxury Wedding – Islamabad","Wedding",new Date("2026-05-18"),"Islamabad","Complete wedding planning, decoration, stage setup, lighting and event coordination.","/images/wedding.svg","Wedding Planning|Decoration Services|Photography|Stage & Lighting"],
    ["Tech Leaders Summit","Corporate",new Date("2026-04-10"),"Rawalpindi","A professional corporate summit with branded stage production and guest management.","/images/corporate.svg","Corporate Events|Conference Management|Stage & Lighting"]
  ];
  for (const e of events) {
    const exists = await prisma.event.findFirst({ where: { name:e[0] as string } });
    if (!exists) await prisma.event.create({ data: { name:e[0] as string, type:e[1] as string, date:e[2] as Date, location:e[3] as string, description:e[4] as string, images:e[5] as string, services:e[6] as string, completed:true } });
  }

  await prisma.aboutContent.upsert({
    where: { id: "about-content" },
    update: {},
    create: { id: "about-content" },
  });
}
main().finally(() => prisma.$disconnect());
