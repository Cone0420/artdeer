import { NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth-server";
import { getStyleMemoryStatus } from "@/lib/ai/style-memory";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const status = getStyleMemoryStatus();
  return NextResponse.json({
    isTrained: status.isTrained,
    trainedAt: status.trainedAt,
    portfolioCount: status.portfolioCount,
    trainedPortfolioCount: status.trainedPortfolioCount,
    tagCount: status.tagCount,
    categoryCount: status.categoryCount,
    needsRetrain: status.needsRetrain,
    profile: status.profile
      ? {
          tonePatterns: status.profile.tonePatterns,
          frequentWords: status.profile.frequentWords,
          sentencePatterns: status.profile.sentencePatterns.slice(0, 12),
          categoryIntros: status.profile.categoryIntros,
        }
      : null,
  });
}
