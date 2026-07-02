import { NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth-server";
import { trainStyleMemoryFromDb } from "@/lib/ai/style-memory";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const profile = trainStyleMemoryFromDb();

    return NextResponse.json({
      ok: true,
      trainedAt: profile.trainedAt,
      portfolioCount: profile.portfolioCount,
      trainedPortfolioCount: profile.trainedPortfolioCount,
      tagCount: profile.tagCount,
      categoryCount: profile.categoryCount,
      profile: {
        tonePatterns: profile.tonePatterns,
        frequentWords: profile.frequentWords,
        sentencePatterns: profile.sentencePatterns.slice(0, 12),
        categoryIntros: profile.categoryIntros,
      },
    });
  } catch {
    return NextResponse.json({ error: "training_failed" }, { status: 500 });
  }
}
