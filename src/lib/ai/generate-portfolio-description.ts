import { normalizePortfolioTags } from "@/lib/portfolio-tags";
import { getMediaFilenameFromUrl } from "@/lib/db/media-service";
import { getStyleContextForGeneration } from "@/lib/ai/style-context";

export type GenerateInput = {
  title: string;
  category: string;
  tags?: string[];
  imageUrl?: string | null;
};

export type PortfolioDescriptionContent = {
  description: string;
};

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function pickRandomUnique<T>(items: T[], count: number): T[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, items.length));
}


function tagStylePhrase(tags: string[]): string {
  if (tags.length === 0) return "세련된";
  if (tags.length === 1) return tags[0]!;
  if (tags.length === 2) return `${tags[0]} ${tags[1]}`;
  return `${tags[0]} ${tags[1]} ${tags[2]}`;
}

function buildTagSentence(tags: string[]): string {
  if (tags.length === 0) {
    return pickRandom([
      "전체적인 분위기와 디테일을 고려하여 자연스럽게 완성했습니다.",
      "컨셉에 맞는 색감과 구성을 세심하게 다듬어 제작했습니다.",
      "작품의 특성을 살릴 수 있도록 균형 있게 구성했습니다.",
    ]);
  }

  if (tags.length === 1) {
    const tag = tags[0]!;
    return pickRandom([
      `${tag} 분위기를 중심으로 제작했으며, 전체 톤에 자연스럽게 녹아들도록 구성했습니다.`,
      `${tag} 컨셉에 맞게 색감과 디테일을 조화롭게 표현했습니다.`,
      `${tag} 스타일을 살려 작품의 개성이 드러나도록 완성했습니다.`,
    ]);
  }

  if (tags.length === 2) {
    const [a, b] = tags;
    return pickRandom([
      `${a} 감성을 중심으로 ${b} 분위기를 살려 제작했습니다.`,
      `${a} 톤과 ${b} 요소를 조화롭게 어우러지도록 구성했습니다.`,
      `${b} 느낌을 살리면서 ${a} 컨셉에 맞게 디테일을 다듬었습니다.`,
    ]);
  }

  const [a, b, c] = tags;
  return pickRandom([
    `${a} 감성을 중심으로 ${b} 분위기를 살려 ${c} 컨셉에 맞게 제작했습니다.`,
    `${b} 톤을 바탕으로 ${a} 스타일과 ${c} 요소를 자연스럽게 조합했습니다.`,
    `${c} 컨셉에 맞춰 ${a} 색감과 ${b} 분위기를 균형 있게 표현했습니다.`,
    `${a}, ${b}, ${c} 요소를 고려해 전체적인 무드를 일관되게 연출했습니다.`,
  ]);
}

const categoryIntros: Record<string, string[]> = {
  포토광장: [
    "감성적인 {tag} 스타일의 포토광장 디자인입니다.",
    "{tag} 분위기를 담은 포토광장 작업물입니다.",
    "포토광장에 어울리는 {tag} 톤의 디자인입니다.",
    "사진 공간의 분위기를 살린 {tag} 스타일 포토광장 디자인입니다.",
  ],
  "캐릭터 디자인": [
    "캐릭터의 개성을 살린 {tag} 컨셉 디자인입니다.",
    "{tag} 무드의 캐릭터 디자인 작업입니다.",
    "캐릭터 특성을 강조한 {tag} 스타일 디자인입니다.",
    "개성과 매력을 담은 {tag} 캐릭터 디자인입니다.",
  ],
  "유튜브 디자인": [
    "시선을 사로잡는 {tag} 스타일의 유튜브 디자인입니다.",
    "{tag} 분위기의 유튜브 채널 디자인 작업입니다.",
    "콘텐츠 전달력을 높인 {tag} 유튜브 디자인입니다.",
    "채널 아이덴티티를 살린 {tag} 스타일 유튜브 디자인입니다.",
  ],
  길드마크: [
    "고급스럽고 상징적인 {tag} 길드마크 디자인입니다.",
    "{tag} 컨셉의 길드마크 작업물입니다.",
    "게임 세계관에 어울리는 {tag} 길드마크 디자인입니다.",
    "상징성과 완성도를 갖춘 {tag} 길드마크 디자인입니다.",
  ],
  "기타 디자인": [
    "컨셉에 맞춘 {tag} 스타일의 디자인입니다.",
    "{tag} 분위기를 담은 디자인 작업입니다.",
    "목적에 맞게 구성한 {tag} 스타일 디자인입니다.",
    "전체적인 톤을 살린 {tag} 디자인 작업입니다.",
  ],
  "게임 포스터": [
    "게임의 분위기를 담은 {tag} 스타일 포스터 디자인입니다.",
    "{tag} 톤의 게임 포스터 작업물입니다.",
    "시각적 임팩트를 살린 {tag} 게임 포스터 디자인입니다.",
    "세계관과 분위기를 표현한 {tag} 스타일 게임 포스터입니다.",
  ],
};

const detailSentences = [
  "깔끔한 레이아웃과 자연스러운 색감을 적용하여 완성도를 높였습니다.",
  "색감과 디테일을 조화롭게 구성하여 귀엽고 완성도 높은 결과물을 제작했습니다.",
  "콘텐츠 전달력을 높일 수 있도록 레이아웃과 컬러를 세심하게 구성했습니다.",
  "게임 분위기에 맞는 컬러와 심볼을 활용하여 높은 완성도로 제작했습니다.",
  "전체적인 분위기와 디테일을 고려하여 깔끔하고 자연스럽게 완성했습니다.",
  "시각적 포인트가 돋보이도록 구성과 색감을 균형 있게 조정했습니다.",
  "디테일한 요소 하나하나에 신경 써 작업의 완성도를 높였습니다.",
  "주제에 맞는 톤앤매너를 유지하며 자연스럽게 마무리했습니다.",
  "레이아웃, 색감, 디테일을 세심하게 다듬어 보기 좋게 완성했습니다.",
  "작품의 특성이 잘 드러나도록 구성과 표현을 정교하게 조율했습니다.",
  "분위기와 컨셉이 한눈에 전달되도록 시각적 흐름을 정리했습니다.",
  "사용 목적에 맞는 디자인 언어로 깔끔하게 표현했습니다.",
  "전체적인 밸런스를 맞추며 자연스럽고 세련된 결과물로 마무리했습니다.",
  "핵심 요소를 강조하고 여백과 색감을 조절해 완성도를 높였습니다.",
  "디자인 의도가 명확히 전달되도록 구성과 디테일을 정돈했습니다.",
  "컨셉에 맞는 색상과 형태를 활용해 조화로운 결과물을 만들었습니다.",
  "작업 목적에 맞게 시각적 완성도와 가독성을 함께 고려했습니다.",
  "세부 표현을 다듬어 전체적인 퀄리티를 한층 높였습니다.",
];

const titleMentions = [
  "「{title}」 작업으로, ",
  "{title} 프로젝트를 바탕으로 ",
  "「{title}」 컨셉을 반영해 ",
  "",
];

const imageHints = [
  "업로드된 이미지의 분위기를 참고해 ",
  "대표 이미지의 톤을 반영하여 ",
  "시각적 요소를 고려해 ",
  "",
];

function isReadableFilename(filename: string): boolean {
  const base = filename.replace(/\.[^.]+$/, "").trim();
  if (!base) return false;
  return !/^[0-9a-f-]{20,}$/i.test(base);
}

function resolveImageFilename(imageUrl?: string | null): string | null {
  if (!imageUrl) return null;
  const filename = getMediaFilenameFromUrl(imageUrl);
  if (!filename || !isReadableFilename(filename)) return null;
  return filename.replace(/\.[^.]+$/, "");
}

function fillTemplate(template: string, tag: string, title: string): string {
  return template.replace(/\{tag\}/g, tag).replace(/\{title\}/g, title);
}

function mergeUniqueStrings(...groups: string[][]): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const group of groups) {
    for (const item of group) {
      const trimmed = item.trim();
      if (!trimmed || seen.has(trimmed)) continue;
      seen.add(trimmed);
      merged.push(trimmed);
    }
  }

  return merged;
}

function resolveCategoryIntroPool(category: string): string[] {
  const style = getStyleContextForGeneration();
  const learned = style.categoryIntros[category] ?? [];
  const defaults = categoryIntros[category] ?? categoryIntros["기타 디자인"]!;

  return mergeUniqueStrings(learned, defaults);
}

function resolveDetailSentences(): string[] {
  const style = getStyleContextForGeneration();
  return mergeUniqueStrings(style.sentencePatterns, style.tonePatterns, detailSentences);
}

function resolveTagStylePhrase(tags: string[]): string {
  if (tags.length > 0) return tagStylePhrase(tags);

  const style = getStyleContextForGeneration();
  const learned = style.frequentWords.slice(0, 3);
  if (learned.length >= 2) return `${learned[0]} ${learned[1]}`;
  if (learned.length === 1) return learned[0]!;
  return "세련된";
}

function buildTagSentenceWithStyle(tags: string[]): string {
  const style = getStyleContextForGeneration();
  const learnedPatterns = style.sentencePatterns.filter((sentence) =>
    tags.some((tag) => sentence.includes(tag))
  );

  if (learnedPatterns.length > 0) {
    return pickRandom(learnedPatterns);
  }

  return buildTagSentence(tags);
}

export function generatePortfolioContent(input: GenerateInput): PortfolioDescriptionContent {
  const title = input.title.trim();
  const category = input.category.trim();
  if (!title) throw new Error("title_required");
  if (!category) throw new Error("category_required");

  const tags = normalizePortfolioTags(input.tags);
  const tagPhrase = resolveTagStylePhrase(tags);
  const introPool = resolveCategoryIntroPool(category);

  const intro = fillTemplate(pickRandom(introPool), tagPhrase, title);
  const tagSentence = buildTagSentenceWithStyle(tags);
  const detailParts = pickRandomUnique(resolveDetailSentences(), 2);
  const titlePrefix = fillTemplate(pickRandom(titleMentions), tagPhrase, title);

  const imageFilename = resolveImageFilename(input.imageUrl);
  const imagePrefix = imageFilename
    ? pickRandom([
        `「${imageFilename}」 이미지의 분위기를 참고해 `,
        `${imageFilename} 작업물을 바탕으로 `,
      ])
    : pickRandom(imageHints);

  const paragraphs = [
    `${titlePrefix}${imagePrefix}${intro}`,
    tagSentence,
    detailParts.join(" "),
  ].filter(Boolean);

  return {
    description: paragraphs.join("\n"),
  };
}

/** @deprecated use generatePortfolioContent */
export function generatePortfolioDescription(input: GenerateInput): string {
  return generatePortfolioContent(input).description;
}
