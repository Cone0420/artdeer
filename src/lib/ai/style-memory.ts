import fs from "fs";
import path from "path";
import type { PortfolioItem } from "@/components/Portfolio/portfolio-data";
import { formatPortfolioDate } from "@/components/Portfolio/portfolio-data";
import { getPortfolioItemsFromDb } from "@/lib/db/portfolio-service";
import { resolveProjectPath } from "@/lib/db/project-root";

export const STYLE_MEMORY_FILENAME = "style-memory.json";

export type StyleMemoryProfile = {
  version: 1;
  trainedAt: string;
  trainedPortfolioCount: number;
  portfolioCount: number;
  tagCount: number;
  categoryCount: number;
  tonePatterns: string[];
  frequentWords: string[];
  sentencePatterns: string[];
  categoryIntros: Record<string, string[]>;
};

export type StyleMemoryStatus = {
  isTrained: boolean;
  trainedAt: string | null;
  portfolioCount: number;
  trainedPortfolioCount: number;
  tagCount: number;
  categoryCount: number;
  needsRetrain: boolean;
  profile: StyleMemoryProfile | null;
};

const STOP_WORDS = new Set([
  "의",
  "을",
  "를",
  "이",
  "가",
  "에",
  "와",
  "과",
  "로",
  "으로",
  "는",
  "은",
  "한",
  "하여",
  "도록",
  "위해",
  "등",
  "및",
  "에서",
  "까지",
  "through",
]);

function getStyleMemoryPath(): string {
  return resolveProjectPath("data", STYLE_MEMORY_FILENAME);
}

function ensureDataDir(): void {
  const dir = path.dirname(getStyleMemoryPath());
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function sortByCount(map: Map<string, number>, limit: number): string[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

function extractSentences(text: string): string[] {
  return text
    .split(/\n+/)
    .flatMap((paragraph) => paragraph.split(/(?<=[.!?])\s+/))
    .map((sentence) => sentence.trim().replace(/\s+/g, " "))
    .filter((sentence) => sentence.length >= 8);
}

function extractTonePatterns(sentences: string[]): string[] {
  const counts = new Map<string, number>();

  for (const sentence of sentences) {
    const endings = sentence.match(
      /[^.。\n]{4,24}(?:디자인입니다|분위기를 표현했습니다|완성도를 높였습니다|제작했습니다|완성했습니다|구성했습니다|표현했습니다|살렸습니다|담았습니다|반영했습니다|조화롭게|자연스럽게)[.]?$/g
    );

    if (endings) {
      for (const ending of endings) {
        const pattern = ending.trim();
        counts.set(pattern, (counts.get(pattern) ?? 0) + 1);
      }
      continue;
    }

    const fallback = sentence.match(/[^.。\n]{5,20}(?:입니다|했습니다|습니다)[.]?$/);
    if (fallback?.[0]) {
      const pattern = fallback[0].trim();
      counts.set(pattern, (counts.get(pattern) ?? 0) + 1);
    }
  }

  return sortByCount(counts, 20);
}

function extractFrequentWords(items: PortfolioItem[]): string[] {
  const counts = new Map<string, number>();

  for (const item of items) {
    for (const tag of item.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 4);
    }

    const sources = [item.description, item.title, item.category];
    for (const source of sources) {
      const words = source.match(/[\uAC00-\uD7A3]{2,}/g) ?? [];
      for (const word of words) {
        if (STOP_WORDS.has(word)) continue;
        counts.set(word, (counts.get(word) ?? 0) + 1);
      }
    }
  }

  return sortByCount(counts, 30);
}

function extractSentencePatterns(items: PortfolioItem[]): string[] {
  const counts = new Map<string, number>();

  for (const item of items) {
    for (const sentence of extractSentences(item.description)) {
      counts.set(sentence, (counts.get(sentence) ?? 0) + 1);
    }
  }

  return sortByCount(counts, 40);
}

function extractCategoryIntros(items: PortfolioItem[]): Record<string, string[]> {
  const grouped = new Map<string, Map<string, number>>();

  for (const item of items) {
    const sentences = extractSentences(item.description);
    if (sentences.length === 0) continue;

    const intro = sentences[0]!;
    const categoryMap = grouped.get(item.category) ?? new Map<string, number>();
    categoryMap.set(intro, (categoryMap.get(intro) ?? 0) + 1);
    grouped.set(item.category, categoryMap);
  }

  const result: Record<string, string[]> = {};
  for (const [category, sentenceMap] of grouped.entries()) {
    result[category] = sortByCount(sentenceMap, 6);
  }

  return result;
}

function countTags(items: PortfolioItem[]): number {
  return items.reduce((sum, item) => sum + (item.tags?.length ?? 0), 0);
}

function countCategories(items: PortfolioItem[]): number {
  return new Set(items.map((item) => item.category)).size;
}

export function analyzePortfolioStyle(items: PortfolioItem[]): StyleMemoryProfile {
  const sentences = items.flatMap((item) => extractSentences(item.description));
  const portfolioCount = items.length;

  return {
    version: 1,
    trainedAt: formatPortfolioDate(),
    trainedPortfolioCount: portfolioCount,
    portfolioCount,
    tagCount: countTags(items),
    categoryCount: countCategories(items),
    tonePatterns: extractTonePatterns(sentences),
    frequentWords: extractFrequentWords(items),
    sentencePatterns: extractSentencePatterns(items),
    categoryIntros: extractCategoryIntros(items),
  };
}

export function readStyleMemoryProfile(): StyleMemoryProfile | null {
  const filePath = getStyleMemoryPath();
  if (!fs.existsSync(filePath)) return null;

  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8")) as StyleMemoryProfile;
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStyleMemoryProfile(profile: StyleMemoryProfile): StyleMemoryProfile {
  ensureDataDir();
  fs.writeFileSync(getStyleMemoryPath(), `${JSON.stringify(profile, null, 2)}\n`, "utf-8");
  return profile;
}

export async function trainStyleMemoryFromDb(): Promise<StyleMemoryProfile> {
  const items = await getPortfolioItemsFromDb();
  const profile = analyzePortfolioStyle(items);
  return writeStyleMemoryProfile(profile);
}

export async function getStyleMemoryStatus(): Promise<StyleMemoryStatus> {
  const profile = readStyleMemoryProfile();
  const items = await getPortfolioItemsFromDb();
  const currentPortfolioCount = items.length;
  const currentTagCount = countTags(items);
  const currentCategoryCount = countCategories(items);

  if (!profile) {
    return {
      isTrained: false,
      trainedAt: null,
      portfolioCount: currentPortfolioCount,
      trainedPortfolioCount: 0,
      tagCount: currentTagCount,
      categoryCount: currentCategoryCount,
      needsRetrain: false,
      profile: null,
    };
  }

  return {
    isTrained: true,
    trainedAt: profile.trainedAt,
    portfolioCount: currentPortfolioCount,
    trainedPortfolioCount: profile.trainedPortfolioCount,
    tagCount: currentTagCount,
    categoryCount: currentCategoryCount,
    needsRetrain: currentPortfolioCount > profile.trainedPortfolioCount,
    profile,
  };
}

export async function checkNeedsStyleRetrain(): Promise<boolean> {
  return (await getStyleMemoryStatus()).needsRetrain;
}
