import { getAdminToken } from "@/lib/admin-auth";

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? "generation_failed";
  } catch {
    return "generation_failed";
  }
}

export async function generatePortfolioDescriptionApi(input: {
  title: string;
  category: string;
  tags?: string[];
  imageUrl?: string | null;
}): Promise<{ description: string }> {
  const token = getAdminToken();
  const response = await fetch("/api/admin/portfolio/generate-description", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as { description: string };
}

import type { PortfolioImageAnalysis } from "@/lib/ai/portfolio-image-analysis-types";

export async function generatePortfolioAutoApi(input: {
  imageUrl: string;
  imageAnalysis: PortfolioImageAnalysis;
  additionalImageUrls?: string[];
}): Promise<{
  title: string;
  description: string;
  tags: string[];
  category: string;
  categoryScores: { category: string; score: number }[];
}> {
  const token = getAdminToken();
  const response = await fetch("/api/admin/portfolio/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as {
    title: string;
    description: string;
    tags: string[];
    category: string;
    categoryScores: { category: string; score: number }[];
  };
}

export function portfolioAiErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    title_required: "제목을 입력해주세요.",
    category_required: "카테고리를 선택해주세요.",
    image_required: "대표 이미지를 먼저 업로드해주세요.",
    analysis_required: "이미지 분석에 실패했습니다. 다시 시도해주세요.",
    image_load_failed: "이미지를 불러오지 못했습니다.",
    image_analysis_failed: "이미지 분석에 실패했습니다.",
    unauthorized: "로그인이 필요합니다.",
    generation_failed: "자동 생성에 실패했습니다. 잠시 후 다시 시도해주세요.",
    empty_result: "생성된 결과가 없습니다. 다시 시도해주세요.",
  };

  return messages[code] ?? "자동 생성에 실패했습니다.";
}
