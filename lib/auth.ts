import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "development-secret-change-me");

export async function createAdminSession(adminId: string) {
  const token = await new SignJWT({ adminId, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
  const store = await cookies();
  store.set("cc_admin", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 });
}

export async function getAdminSession() {
  try {
    const token = (await cookies()).get("cc_admin")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret);
    return payload as { adminId: string; role: string };
  } catch { return null; }
}

export async function clearAdminSession() {
  (await cookies()).delete("cc_admin");
}
