import type { PortfolioCategory } from "@/components/Portfolio/portfolio-data";
import { portfolioCategoryOptions } from "@/components/Portfolio/portfolio-data";
import { generatePortfolioContent } from "@/lib/ai/generate-portfolio-description";
import {
  getStyleContextForGeneration,
  getStyleContextForTagGeneration,
  getStyleContextForTitleGeneration,
} from "@/lib/ai/style-context";
import type { PortfolioImageAnalysis } from "@/lib/ai/portfolio-image-analysis-types";
import { getMoodLabelKo } from "@/lib/ai/portfolio-image-analysis-types";
import { getMediaFilenameFromUrl } from "@/lib/db/media-service";
import { normalizePortfolioTags } from "@/lib/portfolio-tags";

export type CategoryScore = {
  category: PortfolioCategory;
  score: number;
};

export type PortfolioAutoGenerateInput = {
  imageUrl: string;
  imageAnalysis: PortfolioImageAnalysis;
  additionalImageUrls?: string[];
};

export type PortfolioAutoGenerateResult = {
  title: string;
  description: string;
  tags: string[];
  category: PortfolioCategory;
  categoryScores: CategoryScore[];
};

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function isReadableFilename(filename: string): boolean {
  const base = filename.replace(/\.[^.]+$/, "").trim();
  if (!base) return false;
  return !/^[0-9a-f-]{20,}$/i.test(base);
}

async function resolveImageFilename(imageUrl?: string | null): Promise<string | null> {
  if (!imageUrl) return null;
  const filename = await getMediaFilenameFromUrl(imageUrl);
  if (!filename || !isReadableFilename(filename)) return null;
  return filename.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
}

function extractSubjectFromFilename(filename: string | null): string | null {
  if (!filename) return null;
  const cleaned = filename
    .replace(/[_-]+/g, " ")
    .replace(/\b(design|art|img|image|final|v\d+)\b/gi, "")
    .trim();
  if (!cleaned || cleaned.length > 24) return null;
  return cleaned;
}

function scoreCategory(
  category: PortfolioCategory,
  analysis: PortfolioImageAnalysis
): number {
  let score = 2;

  const { orientation, mood, purposeHints, objectHints, aspectRatio } = analysis;

  if (category === "포토광장") {
    if (orientation === "portrait" || orientation === "square") score += 1.5;
    if (mood === "pastel" || mood === "cute" || mood === "soft") score += 1.2;
    if (purposeHints.some((hint) => /포토|광장|프로필|배경/.test(hint))) score += 1.3;
  }

  if (category === "캐릭터 디자인") {
    if (objectHints.includes("캐릭터") || objectHints.includes("키링")) score += 1.4;
    if (mood === "cute" || mood === "pastel") score += 1;
    if (purposeHints.includes("키링")) score += 1.2;
  }

  if (category === "유튜브 디자인") {
    if (orientation === "landscape" && aspectRatio >= 1.4) score += 1.8;
    if (purposeHints.some((hint) => /유튜브|배너|썸네일/.test(hint))) score += 1.5;
  }

  if (category === "게임 포스터") {
    if (mood === "dark" || mood === "gothic" || mood === "vibrant") score += 1.2;
    if (purposeHints.includes("포스터")) score += 1.5;
    if (orientation === "portrait") score += 0.8;
  }

  if (category === "길드마크") {
    if (orientation === "square") score += 1;
    if (purposeHints.includes("길드마크")) score += 1.8;
    if (mood === "gothic" || mood === "dark") score += 0.8;
  }

  if (category === "기타 디자인") {
    score += 0.5;
  }

  const style = getStyleContextForGeneration();
  if (style.categoryIntros[category]?.length) {
    score += 0.4;
  }

  return Math.min(5, Math.max(1, Math.round(score)));
}

function resolveCategoryScores(analysis: PortfolioImageAnalysis): CategoryScore[] {
  return portfolioCategoryOptions
    .map((category) => ({
      category,
      score: scoreCategory(category, analysis),
    }))
    .sort((a, b) => b.score - a.score);
}

function resolvePurposeLabel(
  analysis: PortfolioImageAnalysis,
  category: PortfolioCategory
): string {
  if (analysis.purposeHints[0]) return analysis.purposeHints[0];

  const map: Record<PortfolioCategory, string[]> = {
    포토광장: ["포토광장", "프로필 배경", "감성 포토광장"],
    "캐릭터 디자인": ["캐릭터 디자인", "키링 디자인", "프로필 디자인"],
    "유튜브 디자인": ["유튜브 디자인", "채널아트", "썸네일 디자인"],
    "게임 포스터": ["게임 포스터", "키비주얼 포스터"],
    길드마크: ["길드마크", "엠블럼 디자인"],
    "기타 디자인": ["디자인", "일러스트"],
  };

  return pickRandom(map[category]);
}

async function generateTitle(
  analysis: PortfolioImageAnalysis,
  category: PortfolioCategory,
  imageUrl: string
): Promise<string> {
  const style = getStyleContextForTitleGeneration();
  const filename = await resolveImageFilename(imageUrl);
  const subject = extractSubjectFromFilename(filename);
  const moodLabel = getMoodLabelKo(analysis.mood);
  const color = analysis.colorNames[0] ?? (analysis.isPastel ? "파스텔" : "");
  const purpose = resolvePurposeLabel(analysis, category);

  const learnedWord = style.frequentWords.find(
    (word) => word.length >= 2 && !["디자인", "작업", "포트폴리오"].includes(word)
  );

  const patterns: string[] = [];

  if (subject && color) patterns.push(`${subject} ${color} ${purpose}`);
  if (subject && moodLabel) patterns.push(`${subject} ${moodLabel} ${purpose}`);
  if (moodLabel && color) patterns.push(`${moodLabel} 감성 ${purpose}`);
  if (subject) patterns.push(`${subject} ${purpose}`);
  if (learnedWord && color) patterns.push(`${learnedWord} ${color} ${purpose}`);
  if (color) patterns.push(`${color} ${purpose}`);
  patterns.push(`${purpose}`);

  const title = pickRandom(patterns)
    .replace(/\s+/g, " ")
    .replace(/디자인 디자인/g, "디자인")
    .trim();

  if (!title.endsWith("디자인") && !title.includes("포토광장") && !title.includes("포스터")) {
    return `${title} 디자인`.replace(/\s+/g, " ").trim();
  }

  return title;
}

function generateTags(analysis: PortfolioImageAnalysis, category: PortfolioCategory): string[] {
  const style = getStyleContextForTagGeneration();
  const tags = new Set<string>();

  for (const color of analysis.colorNames.slice(0, 3)) {
    tags.add(color);
  }

  if (analysis.isPastel) tags.add("파스텔");
  if (analysis.mood === "gothic") tags.add("고딕");
  if (analysis.mood === "cute") tags.add("귀여움");
  if (analysis.mood === "dark") tags.add("다크");

  for (const decor of analysis.decorHints) tags.add(decor);
  for (const object of analysis.objectHints) tags.add(object);

  const categoryTags: Record<PortfolioCategory, string[]> = {
    포토광장: ["포토광장", "프로필", "배경"],
    "캐릭터 디자인": ["캐릭터", "키링", "일러스트"],
    "유튜브 디자인": ["유튜브", "썸네일", "채널아트"],
    "게임 포스터": ["게임", "포스터", "키비주얼"],
    길드마크: ["길드마크", "엠블럼", "심볼"],
    "기타 디자인": ["디자인", "일러스트"],
  };

  for (const tag of categoryTags[category].slice(0, 2)) {
    tags.add(tag);
  }

  for (const word of style.frequentWords.slice(0, 4)) {
    if (word.length >= 2) tags.add(word);
  }

  return normalizePortfolioTags([...tags]).slice(0, 10);
}

function trimDescriptionLength(description: string, max = 250): string {
  const normalized = description.replace(/\n+/g, "\n").trim();
  if (normalized.length <= max) return normalized;

  const paragraphs = normalized.split("\n");
  let result = "";

  for (const paragraph of paragraphs) {
    const next = result ? `${result}\n${paragraph}` : paragraph;
    if (next.length > max) break;
    result = next;
  }

  if (result.length >= 100) return result;

  const sentences = normalized.replace(/\n+/g, " ").split(/(?<=[.!?])\s+/);
  let compact = "";
  for (const sentence of sentences) {
    const next = compact ? `${compact} ${sentence}` : sentence;
    if (next.length > max) break;
    compact = next;
  }

  return compact || normalized.slice(0, max).trim();
}

export async function generatePortfolioAutoContent(
  input: PortfolioAutoGenerateInput
): Promise<PortfolioAutoGenerateResult> {
  if (!input.imageUrl?.trim()) throw new Error("image_required");
  if (!input.imageAnalysis) throw new Error("analysis_required");

  const categoryScores = resolveCategoryScores(input.imageAnalysis);
  const category = categoryScores[0]?.category ?? "기타 디자인";
  const tags = generateTags(input.imageAnalysis, category);
  const title = await generateTitle(input.imageAnalysis, category, input.imageUrl);

  const { description: rawDescription } = await generatePortfolioContent({
    title,
    category,
    tags,
    imageUrl: input.imageUrl,
  });

  return {
    title,
    description: trimDescriptionLength(rawDescription),
    tags,
    category,
    categoryScores,
  };
}
