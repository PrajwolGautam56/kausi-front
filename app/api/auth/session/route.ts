import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
export async function GET() { const session = await requireAdmin(); return NextResponse.json({ authenticated: Boolean(session), session }); }
