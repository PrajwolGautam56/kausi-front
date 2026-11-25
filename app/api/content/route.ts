import { NextResponse } from "next/server";
import { connectDB, isDemoMode } from "@/lib/db";
import { ContentModel } from "@/lib/models";
import { defaultContent } from "@/data/defaults";
import { memoryStore } from "@/lib/memory";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  if (isDemoMode()) return NextResponse.json({ payload: memoryStore.content, demoMode: true });
  await connectDB();
  const doc = await ContentModel.findOne({ key: "main" }).lean();
  return NextResponse.json({ payload: doc?.payload || defaultContent, demoMode: false });
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payload = await request.json();
  if (isDemoMode()) { memoryStore.content = payload; return NextResponse.json({ payload, demoMode: true }); }
  await connectDB();
  const doc = await ContentModel.findOneAndUpdate({ key: "main" }, { payload }, { upsert: true, new: true }).lean();
  return NextResponse.json({ payload: doc.payload, demoMode: false });
}
