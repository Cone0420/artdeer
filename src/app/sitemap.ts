import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-config";
import { getServerPortfolioIds } from "@/lib/portfolio-server";
import { getServerReviewIds } from "@/lib/reviews-server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const portfolioIds = isSupabaseConfigured() ? await getServerPortfolioIds() : [];
  const reviewIds = isSupabaseConfigured() ? await getServerReviewIds() : [];

  return [
    {
      url: getSiteUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: getSiteUrl("/portfolio"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: getSiteUrl("/reviews"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    ...portfolioIds.map((id) => ({
      url: getSiteUrl(`/portfolio/${id}`),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...reviewIds.map((id) => ({
      url: getSiteUrl(`/reviews/${id}`),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
  ];
}
