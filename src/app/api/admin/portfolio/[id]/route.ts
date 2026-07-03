import { NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth-server";
import {
  deletePortfolioItemInDb,
  updatePortfolioItemInDb,
} from "@/lib/db/portfolio-service";
import type { PortfolioItemInput } from "@/components/Portfolio/portfolio-data";
import { parsePortfolioTagsInput } from "@/lib/portfolio-tags";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = (await request.json()) as PortfolioItemInput & {
      tagsInput?: string;
    };

    const item = updatePortfolioItemInDb(id, {
      ...body,
      tags:
        body.tags ??
        (body.tagsInput !== undefined ? parsePortfolioTagsInput(body.tagsInput) : undefined),
    });

    if (!item) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!isAuthorizedAdminRequest(request)) {
    console.warn("[portfolio-delete] API unauthorized");
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  console.info("[portfolio-delete] API DELETE handler", { id });

  const deleted = deletePortfolioItemInDb(id);
  console.info("[portfolio-delete] API delete result", { id, deleted });

  if (!deleted) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
