import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { COOKIE_NAME, createAdminToken } from "@/lib/auth";
import { connectDB, isDemoMode } from "@/lib/db";
import { AdminModel } from "@/lib/models";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const normalizedEmail = String(email || "").trim().toLowerCase();
  let valid = false;
  if (isDemoMode()) {
    valid = normalizedEmail === (process.env.ADMIN_EMAIL || "admin@hotelkausi.com").toLowerCase() && password === "kausi2026";
  } else {
    await connectDB();
    const admin = await AdminModel.findOne({ email: normalizedEmail, active: true });
    valid = Boolean(admin && await bcrypt.compare(String(password || ""), admin.passwordHash));
    if (valid && admin) {
      admin.lastLoginAt = new Date();
      await admin.save();
    }
  }
  if (!valid) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  const response = NextResponse.json({ ok: true, email: normalizedEmail });
  response.cookies.set(COOKIE_NAME, await createAdminToken(normalizedEmail), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 12 });
  return response;
}
