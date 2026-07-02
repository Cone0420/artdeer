import { NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth-server";
import { generatePortfolioAutoContent } from "@/lib/ai/generate-portfolio-auto";
import type { PortfolioImageAnalysis } from "@/lib/ai/portfolio-image-analysis-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      imageUrl?: string;
      imageAnalysis?: PortfolioImageAnalysis;
      additionalImageUrls?: string[];
    };

    const imageUrl = body.imageUrl?.trim() ?? "";
    const imageAnalysis = body.imageAnalysis;

    if (!imageUrl) {
      return NextResponse.json({ error: "image_required" }, { status: 400 });
    }
    if (!imageAnalysis) {
      return NextResponse.json({ error: "analysis_required" }, { status: 400 });
    }

    const result = generatePortfolioAutoContent({
      imageUrl,
      imageAnalysis,
      additionalImageUrls: body.additionalImageUrls,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "image_required") {
        return NextResponse.json({ error: "image_required" }, { status: 400 });
      }
      if (error.message === "analysis_required") {
        return NextResponse.json({ error: "analysis_required" }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "generation_failed" }, { status: 500 });
  }
}
