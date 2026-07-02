import { NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth-server";
import { saveMediaFile, toMediaUrl } from "@/lib/db/media-service";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function POST(request: Request) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const record = saveMediaFile(buffer, file.type, file.name);

    return NextResponse.json({ id: record.id, url: toMediaUrl(record.id) });
  } catch (error) {
    console.error("[api/media]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
