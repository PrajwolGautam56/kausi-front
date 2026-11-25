import mongoose, { Schema } from "mongoose";

const BookingSchema = new Schema(
  {
    reference: { type: String, required: true, unique: true, index: true },
    guestName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    roomId: { type: String, required: true, index: true },
    roomName: String,
    checkIn: { type: String, required: true, index: true },
    checkOut: { type: String, required: true, index: true },
    adults: { type: Number, required: true },
    children: { type: Number, default: 0 },
    rooms: { type: Number, default: 1 },
    specialRequests: String,
    status: { type: String, enum: ["pending", "confirmed", "checked-in", "completed", "cancelled"], default: "pending" },
    source: { type: String, enum: ["website", "walk-in", "phone", "partner"], default: "website" },
    total: Number,
  },
  { timestamps: true },
);

const ContentSchema = new Schema(
  { key: { type: String, unique: true, default: "main" }, payload: { type: Schema.Types.Mixed, required: true } },
  { timestamps: true },
);

const RateSchema = new Schema(
  {
    date: { type: String, required: true },
    roomId: { type: String, required: true },
    price: { type: Number, required: true },
    availableRooms: { type: Number, required: true },
    closed: { type: Boolean, default: false },
  },
  { timestamps: true },
);
RateSchema.index({ date: 1, roomId: 1 }, { unique: true });

const AdminSchema = new Schema(
  {
    name: { type: String, required: true, default: "Hotel Kausi Admin" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin"], default: "admin" },
    active: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  { timestamps: true },
);

export const BookingModel = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
export const ContentModel = mongoose.models.Content || mongoose.model("Content", ContentSchema);
export const RateModel = mongoose.models.Rate || mongoose.model("Rate", RateSchema);
export const AdminModel = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
