import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/api/route-error";
import { noCacheJsonResponse } from "@/lib/api/no-cache-response";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth-server";
import { createPortfolioItemInDb } from "@/lib/db/portfolio-service";
import type { PortfolioItemInput } from "@/components/Portfolio/portfolio-data";
import { parsePortfolioTagsInput } from "@/lib/portfolio-tags";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as PortfolioItemInput & {
      tagsInput?: string;
    };

    const item = await createPortfolioItemInDb({
      ...body,
      tags:
        body.tags ??
        (body.tagsInput !== undefined ? parsePortfolioTagsInput(body.tagsInput) : undefined),
    });

    return noCacheJsonResponse({ item }, { status: 201 });
  } catch (error) {
    return apiErrorResponse("api/admin/portfolio POST", error, "create_failed");
  }
}
