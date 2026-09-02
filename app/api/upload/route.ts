import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Aap logged in nahi hain. Please dobara login karein." }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || typeof (file as any).arrayBuffer !== "function") {
      return NextResponse.json({ error: "Koi file select nahi hui." }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "Selected file khaali hai." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File 8MB se bari hai. Chotii image try karein." }, { status: 400 });
    }

    const mime = file.type || "";
    const extFromMime = ALLOWED_TYPES[mime];
    if (!extFromMime) {
      return NextResponse.json(
        { error: "Sirf JPG, PNG, WEBP ya GIF images allowed hain." },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const dataBase64 = bytes.toString("base64");

    // Store image in Neon PostgreSQL database so it persists on Vercel
    const stored = await db.storedImage.create({
      data: { data: dataBase64, mimeType: mime },
    });

    return NextResponse.json({ url: `/api/image/${stored.id}` });
  } catch (e: any) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: e?.message ? `Upload failed: ${e.message}` : "Upload failed. Server error." },
      { status: 500 }
    );
  }
}