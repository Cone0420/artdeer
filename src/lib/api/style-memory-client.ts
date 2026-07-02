import { getAdminToken } from "@/lib/admin-auth";

export type StyleMemoryStatusResponse = {
  isTrained: boolean;
  trainedAt: string | null;
  portfolioCount: number;
  trainedPortfolioCount: number;
  tagCount: number;
  categoryCount: number;
  needsRetrain: boolean;
  profile: {
    tonePatterns: string[];
    frequentWords: string[];
    sentencePatterns: string[];
    categoryIntros: Record<string, string[]>;
  } | null;
};

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? "request_failed";
  } catch {
    return "request_failed";
  }
}

function authHeaders(): HeadersInit {
  const token = getAdminToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchStyleMemoryStatus(): Promise<StyleMemoryStatusResponse> {
  const response = await fetch("/api/admin/style-memory", {
    headers: authHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as StyleMemoryStatusResponse;
}

export async function trainStyleMemoryApi(): Promise<StyleMemoryStatusResponse & { ok: true }> {
  const response = await fetch("/api/admin/style-memory/train", {
    method: "POST",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as {
    ok: true;
    trainedAt: string;
    portfolioCount: number;
    trainedPortfolioCount: number;
    tagCount: number;
    categoryCount: number;
    profile: StyleMemoryStatusResponse["profile"];
  };

  return {
    ok: true,
    isTrained: true,
    trainedAt: data.trainedAt,
    portfolioCount: data.portfolioCount,
    trainedPortfolioCount: data.trainedPortfolioCount,
    tagCount: data.tagCount,
    categoryCount: data.categoryCount,
    needsRetrain: false,
    profile: data.profile,
  };
}

export function styleMemoryErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    unauthorized: "로그인이 필요합니다.",
    training_failed: "스타일 학습에 실패했습니다. 잠시 후 다시 시도해주세요.",
    request_failed: "스타일 정보를 불러오지 못했습니다.",
  };

  return messages[code] ?? "요청에 실패했습니다.";
}
