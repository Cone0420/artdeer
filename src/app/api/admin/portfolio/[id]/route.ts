import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/route-error";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth-server";
import {
  deletePortfolioItemInDb,
  getPortfolioItemsFromDb,
  updatePortfolioItemInDb,
} from "@/lib/db/portfolio-service";
import { getPortfolioDeleteDiagnostics } from "@/lib/db/vercel-db-sync";
import { useSupabaseDatabase } from "@/lib/db/provider";
import type { PortfolioItemInput } from "@/components/Portfolio/portfolio-data";
import { parsePortfolioTagsInput } from "@/lib/portfolio-tags";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

function normalizeRouteId(rawId: string): string {
  try {
    return decodeURIComponent(rawId).trim();
  } catch {
    return rawId.trim();
  }
}

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id: rawId } = await context.params;
  const id = normalizeRouteId(rawId);

  try {
    const body = (await request.json()) as PortfolioItemInput & {
      tagsInput?: string;
    };

    const item = await updatePortfolioItemInDb(id, {
      ...body,
      tags:
        body.tags ??
        (body.tagsInput !== undefined ? parsePortfolioTagsInput(body.tagsInput) : undefined),
    });

    if (!item) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    return apiErrorResponse("api/admin/portfolio/[id] PUT", error, "update_failed", 500, { id });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!(await isAuthorizedAdminRequest(request))) {
    console.warn("[portfolio-delete] API unauthorized");
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id: rawId } = await context.params;
  const id = normalizeRouteId(rawId);

  const diagnostics = !useSupabaseDatabase() ? getPortfolioDeleteDiagnostics(id) : null;
  const itemsBeforeDelete = await getPortfolioItemsFromDb().catch(() => []);
  const sqliteIds = itemsBeforeDelete.map((item) => item.id);

  console.info("[portfolio-delete] API DELETE handler", {
    rawId,
    id,
    sqliteIds,
    diagnostics,
  });

  try {
    const deleted = await deletePortfolioItemInDb(id);
    console.info("[portfolio-delete] API delete result", { id, deleted });

    if (!deleted) {
      const payload: Record<string, unknown> = { error: "not_found" };
      if (diagnostics) {
        payload.errorMessage = `Portfolio id "${id}" was not found in runtime SQLite after merge.`;
        payload.debug = {
          rawRouteId: rawId,
          sqliteIds,
          ...diagnostics,
        };
      }
      return NextResponse.json(payload, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiErrorResponse("api/admin/portfolio/[id] DELETE", error, "delete_failed", 500, { id });
  }
}
