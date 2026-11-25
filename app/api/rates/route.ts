import { NextResponse } from "next/server";
import { connectDB, isDemoMode } from "@/lib/db";
import { RateModel } from "@/lib/models";
import { memoryStore } from "@/lib/memory";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (isDemoMode()) return NextResponse.json({ rates: memoryStore.rates, demoMode: true });
  await connectDB();
  return NextResponse.json({ rates: await RateModel.find({}).lean(), demoMode: false });
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rate = await request.json();
  if (isDemoMode()) {
    const i = memoryStore.rates.findIndex((r) => r.date === rate.date && r.roomId === rate.roomId);
    if (i >= 0) memoryStore.rates[i] = rate; else memoryStore.rates.push(rate);
    return NextResponse.json({ rate, demoMode: true });
  }
  await connectDB();
  const saved = await RateModel.findOneAndUpdate({ date: rate.date, roomId: rate.roomId }, rate, { upsert: true, new: true }).lean();
  return NextResponse.json({ rate: saved, demoMode: false });
}
