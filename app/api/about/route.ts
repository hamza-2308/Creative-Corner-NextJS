import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

const SINGLETON_ID = "about-content";

const defaults = {
  id: SINGLETON_ID,
  storyTitle: "Small ideas can become extraordinary moments.",
  storyText1: "Creative Corner brings together event planners, designers, coordinators and production partners to deliver celebrations and business events with confidence.",
  storyText2: "Our mission is simple: create meaningful experiences without putting the pressure of coordination on our clients.",
  storyImage: "/images/about-story.svg",
  teamImage: "/images/about-team.svg",
  mission: "Deliver thoughtful, reliable and creative event experiences.",
  vision: "Become the trusted event partner for celebrations and businesses.",
  whyUs: "Transparent planning, professional teams and complete coordination.",
};

export async function GET() {
  const c = await db.aboutContent.findUnique({ where: { id: SINGLETON_ID } });
  return NextResponse.json(c || defaults);
}

export async function PUT(req: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = await req.json();
    delete data.id;
    delete data.updatedAt;
    const x = await db.aboutContent.upsert({
      where: { id: SINGLETON_ID },
      update: data,
      create: { id: SINGLETON_ID, ...data },
    });
    return NextResponse.json(x);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Invalid data" }, { status: 400 });
  }
}
