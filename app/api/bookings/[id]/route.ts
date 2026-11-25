import { NextResponse } from "next/server";
import { connectDB, isDemoMode } from "@/lib/db";
import { BookingModel } from "@/lib/models";
import { memoryStore } from "@/lib/memory";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const updates = await request.json();
  if (isDemoMode()) {
    const index = memoryStore.bookings.findIndex((b) => b.id === id || (b as { _id?: string })._id === id);
    if (index < 0) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    memoryStore.bookings[index] = { ...memoryStore.bookings[index], ...updates };
    return NextResponse.json({ booking: memoryStore.bookings[index] });
  }
  await connectDB();
  const booking = await BookingModel.findByIdAndUpdate(id, updates, { new: true }).lean();
  return booking ? NextResponse.json({ booking }) : NextResponse.json({ error: "Booking not found" }, { status: 404 });
}
