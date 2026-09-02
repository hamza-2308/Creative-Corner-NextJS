import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

const SINGLETON_ID = "about-content";

export async function GET() {
  const c = await db.aboutContent.findUnique({ where: { id: SINGLETON_ID } });
  return NextResponse.json(c);
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
