import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const img = await db.storedImage.findUnique({ where: { id } });
    if (!img) return new NextResponse("Image not found", { status: 404 });

    const bytes = Buffer.from(img.data, "base64");
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": img.mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    console.error("Image fetch error:", e);
    return new NextResponse("Image server error", { status: 500 });
  }
}