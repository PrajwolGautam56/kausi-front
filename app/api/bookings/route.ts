import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB, isDemoMode } from "@/lib/db";
import { BookingModel, ContentModel, RateModel } from "@/lib/models";
import { memoryStore } from "@/lib/memory";
import { requireAdmin } from "@/lib/auth";

const bookingSchema = z.object({
  guestName: z.string().min(2).max(100),
  email: z.email(),
  phone: z.string().min(7).max(30),
  roomId: z.string().min(1),
  checkIn: z.iso.date(),
  checkOut: z.iso.date(),
  adults: z.number().int().min(1).max(12),
  children: z.number().int().min(0).max(8).default(0),
  rooms: z.number().int().min(1).max(6).default(1),
  specialRequests: z.string().max(1000).optional(),
  source: z.enum(["website", "walk-in", "phone", "partner"]).default("website"),
  status: z.enum(["pending", "confirmed", "checked-in", "completed", "cancelled"]).optional(),
});

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (isDemoMode()) return NextResponse.json({ bookings: memoryStore.bookings, demoMode: true });
  await connectDB();
  const bookings = await BookingModel.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ bookings, demoMode: false });
}

export async function POST(request: Request) {
  const raw = await request.json();
  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Please check the booking details", details: parsed.error.flatten() }, { status: 400 });
  if (parsed.data.checkOut <= parsed.data.checkIn) return NextResponse.json({ error: "Check-out must be after check-in" }, { status: 400 });
  let room = memoryStore.content.rooms.find((r) => r.id === parsed.data.roomId);
  let existing: Array<{ checkIn: string; checkOut: string; rooms?: number }> = [];
  let overrides: Array<{ date: string; price: number; availableRooms: number; closed?: boolean }> = [];
  if (isDemoMode()) {
    existing = memoryStore.bookings.filter((b) => b.roomId === parsed.data.roomId && ["confirmed", "checked-in"].includes(b.status || "") && b.checkIn < parsed.data.checkOut && b.checkOut > parsed.data.checkIn);
    overrides = memoryStore.rates.filter((r) => r.roomId === parsed.data.roomId && r.date >= parsed.data.checkIn && r.date < parsed.data.checkOut);
  } else {
    await connectDB();
    const [contentDoc, bookingDocs, rateDocs] = await Promise.all([
      ContentModel.findOne({ key: "main" }).lean(),
      BookingModel.find({ roomId: parsed.data.roomId, status: { $in: ["confirmed", "checked-in"] }, checkIn: { $lt: parsed.data.checkOut }, checkOut: { $gt: parsed.data.checkIn } }, { checkIn: 1, checkOut: 1, rooms: 1 }).lean(),
      RateModel.find({ roomId: parsed.data.roomId, date: { $gte: parsed.data.checkIn, $lt: parsed.data.checkOut } }).lean(),
    ]);
    room = (contentDoc?.payload?.rooms || memoryStore.content.rooms).find((r: { id: string }) => r.id === parsed.data.roomId);
    existing = bookingDocs as unknown as typeof existing;
    overrides = rateDocs as unknown as typeof overrides;
  }
  if (!room) return NextResponse.json({ error: "Selected room type is not available" }, { status: 404 });
  const stayDates: string[] = [];
  for (let cursor = new Date(`${parsed.data.checkIn}T00:00:00Z`); cursor < new Date(`${parsed.data.checkOut}T00:00:00Z`); cursor = new Date(cursor.getTime() + 86400000)) stayDates.push(cursor.toISOString().slice(0, 10));
  const unavailableDate = stayDates.find((date) => {
    const rule = overrides.find((r) => r.date === date);
    if (rule?.closed) return true;
    const inventory = rule?.availableRooms ?? room.availableRooms;
    const committed = existing.filter((b) => b.checkIn <= date && b.checkOut > date).reduce((sum, b) => sum + (b.rooms || 1), 0);
    return inventory - committed < parsed.data.rooms;
  });
  if (unavailableDate) return NextResponse.json({ error: `The selected room is not available on ${unavailableDate}. Please choose different dates or contact the hotel.` }, { status: 409 });
  const reference = `HK-${new Date().getFullYear().toString().slice(-2)}${Math.random().toString(10).slice(2, 8)}`;
  const stayTotal = stayDates.reduce((sum, date) => sum + (overrides.find((r) => r.date === date)?.price ?? room.price), 0) * parsed.data.rooms;
  const booking = { ...parsed.data, reference, roomName: room.name, status: parsed.data.status || "pending", total: stayTotal, createdAt: new Date().toISOString() };
  if (isDemoMode()) { const saved = { ...booking, id: crypto.randomUUID() }; memoryStore.bookings.unshift(saved); return NextResponse.json({ booking: saved, demoMode: true }, { status: 201 }); }
  const saved = await BookingModel.create(booking);
  return NextResponse.json({ booking: saved.toObject(), demoMode: false }, { status: 201 });
}
