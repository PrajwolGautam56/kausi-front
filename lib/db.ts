import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalWithMongoose = global as typeof globalThis & { mongooseCache?: Cache };
const cache = globalWithMongoose.mongooseCache ?? { conn: null, promise: null };
globalWithMongoose.mongooseCache = cache;

export const isDemoMode = () => process.env.DEMO_MODE === "true" || !MONGODB_URI;

export async function connectDB() {
  if (!MONGODB_URI) throw new Error("MONGODB_URI is not configured");
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, { dbName: "hotel-kausi", bufferCommands: false });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
