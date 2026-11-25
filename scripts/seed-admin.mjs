import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const passwordHash = process.env.ADMIN_PASSWORD_HASH;

if (!uri || !email || !passwordHash) {
  console.error("MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD_HASH are required.");
  process.exit(1);
}

await mongoose.connect(uri, { dbName: "hotel-kausi", bufferCommands: false });

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "admin" },
    active: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  { timestamps: true },
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);
await Admin.findOneAndUpdate(
  { email },
  { name: "Hotel Kausi Admin", email, passwordHash, role: "admin", active: true },
  { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
);
await Admin.updateMany({ email: { $ne: email } }, { active: false });

console.log(`Admin account is ready: ${email}`);
await mongoose.disconnect();
