import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/route-error";
import { noCacheJsonResponse } from "@/lib/api/no-cache-response";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth-server";
import { reorderPortfolioItemInDb } from "@/lib/db/portfolio-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { id?: string; direction?: "up" | "down" };
    const id = body.id?.trim() ?? "";
    const direction = body.direction;

    if (!id || (direction !== "up" && direction !== "down")) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    const ok = await reorderPortfolioItemInDb(id, direction);
    if (!ok) {
      return NextResponse.json({ error: "reorder_failed" }, { status: 400 });
    }

    return noCacheJsonResponse({ ok: true });
  } catch (error) {
    return apiErrorResponse("api/admin/portfolio/reorder POST", error, "reorder_failed");
  }
}
