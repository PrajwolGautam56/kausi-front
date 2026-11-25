import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) return NextResponse.json({ error: "Cloudinary is not configured yet" }, { status: 503 });
  cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No image received" }, { status: 400 });
  if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Upload an image smaller than 10 MB" }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  const uploaded = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    cloudinary.uploader.upload_stream({ folder: "hotel-kausi", transformation: [{ quality: "auto", fetch_format: "auto" }] }, (error, result) => error || !result ? reject(error) : resolve(result as { secure_url: string; public_id: string })).end(bytes);
  });
  return NextResponse.json(uploaded, { status: 201 });
}
