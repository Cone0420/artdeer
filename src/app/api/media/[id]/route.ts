import { NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth-server";
import { deleteMediaFile, getMediaFile } from "@/lib/db/media-service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const media = await getMediaFile(id);

  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(media.buffer), {
    headers: {
      "Content-Type": media.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const deleted = await deleteMediaFile(id);
  return NextResponse.json({ deleted });
}
