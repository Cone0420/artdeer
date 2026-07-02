import { NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth-server";
import { generatePortfolioContent } from "@/lib/ai/generate-portfolio-description";
import { normalizePortfolioTags, parsePortfolioTagsInput } from "@/lib/portfolio-tags";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      title?: string;
      category?: string;
      tags?: string[] | string;
      imageUrl?: string | null;
    };

    const title = body.title?.trim() ?? "";
    const category = body.category?.trim() ?? "";
    const imageUrl = body.imageUrl ?? null;
    const tags =
      typeof body.tags === "string"
        ? parsePortfolioTagsInput(body.tags)
        : normalizePortfolioTags(body.tags);

    if (!title) {
      return NextResponse.json({ error: "title_required" }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ error: "category_required" }, { status: 400 });
    }

    const content = generatePortfolioContent({ title, category, tags, imageUrl });
    return NextResponse.json(content);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "title_required") {
        return NextResponse.json({ error: "title_required" }, { status: 400 });
      }
      if (error.message === "category_required") {
        return NextResponse.json({ error: "category_required" }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "generation_failed" }, { status: 500 });
  }
}
