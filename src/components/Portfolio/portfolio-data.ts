export type PortfolioCategory =
  | "게임 포스터"
  | "유튜브 디자인"
  | "포토광장"
  | "길드마크"
  | "캐릭터 디자인"
  | "기타 디자인";

export type PortfolioImagePreset =
  | "purple-girl"
  | "night-blue"
  | "cute-purple"
  | "starry-night"
  | "channel"
  | "guild"
  | "youtube"
  | "photo";

export type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  category: PortfolioCategory;
  date: string;
  tags?: string[];
  image?: PortfolioImagePreset;
  imageUrl?: string | null;
};

export function formatPortfolioDate(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

export function portfolioDateToInputValue(date: string): string {
  const parts = date.split(".");
  if (parts.length !== 3) return "";
  const [y, m, d] = parts.map((part) => part.trim());
  if (!y || !m || !d) return "";
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export function inputValueToPortfolioDate(value: string): string {
  if (!value) return formatPortfolioDate();
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return formatPortfolioDate();
  return `${y}.${m.padStart(2, "0")}.${d.padStart(2, "0")}`;
}

import { normalizePortfolioTags } from "@/lib/portfolio-tags";

export function normalizePortfolioCategory(category: string): PortfolioCategory {
  if (category === "채널아트") return "포토광장";
  if (portfolioCategoryOptions.includes(category as PortfolioCategory)) {
    return category as PortfolioCategory;
  }
  return "기타 디자인";
}

export function normalizePortfolioItem(item: PortfolioItem): PortfolioItem {
  const normalized = {
    ...item,
    category: normalizePortfolioCategory(item.category),
    date: item.date?.trim() || formatPortfolioDate(),
    tags: normalizePortfolioTags(item.tags),
  };

  delete (normalized as { tools?: string[] }).tools;

  return normalized;
}

export const portfolioCategoryOptions: PortfolioCategory[] = [
  "게임 포스터",
  "유튜브 디자인",
  "포토광장",
  "길드마크",
  "캐릭터 디자인",
  "기타 디자인",
];

export const portfolioCategories: { label: string; value: PortfolioCategory | "all" }[] = [
  { label: "전체", value: "all" },
  ...portfolioCategoryOptions.map((c) => ({ label: c, value: c })),
];

export const seedPortfolioItems: PortfolioItem[] = [
  {
    id: "1",
    title: "별빛 모험가 포스터",
    description:
      "판타지 RPG 콘셉트의 메인 키비주얼 포스터입니다. 캐릭터와 배경을 함께 구성해 몽환적인 분위기를 표현했습니다.",
    category: "게임 포스터",
    date: "2024.11.12",
    image: "purple-girl",
  },
  {
    id: "2",
    title: "네온 시티 썸네일",
    description:
      "유튜브 게임 플레이 영상용 썸네일 디자인입니다. 강렬한 타이포와 캐릭터 실루엣으로 클릭률을 높였습니다.",
    category: "유튜브 디자인",
    date: "2024.10.28",
    image: "youtube",
  },
  {
    id: "3",
    title: "달빛 스트리머 채널아트",
    description:
      "트위치/유튜브 채널 배너 작업입니다. 스트리머 콘셉트에 맞춘 보라색 톤의 채널 아트입니다.",
    category: "포토광장",
    date: "2024.10.05",
    image: "channel",
  },
  {
    id: "4",
    title: "추억의 포토광장",
    description:
      "커뮤니티 포토광장용 합성 및 보정 작업입니다. 따뜻한 필터와 레이아웃으로 분위기를 살렸습니다.",
    category: "포토광장",
    date: "2024.09.20",
    image: "photo",
  },
  {
    id: "5",
    title: "드래곤 길드 엠블럼",
    description:
      "MMORPG 길드 마크 디자인입니다. 방패 형태의 엠블럼에 드래곤 심볼을 적용했습니다.",
    category: "길드마크",
    date: "2024.09.08",
    image: "guild",
  },
  {
    id: "6",
    title: "귀여운 마스코트 일러스트",
    description:
      "커뮤니티 이벤트용 마스코트 캐릭터 디자인입니다. 친근하고 귀여운 느낌을 강조했습니다.",
    category: "캐릭터 디자인",
    date: "2024.08.30",
    image: "cute-purple",
  },
  {
    id: "7",
    title: "미드나잇 어드벤처",
    description:
      "액션 RPG 프로모션 포스터입니다. 야경과 캐릭터를 조합해 드라마틱한 장면을 연출했습니다.",
    category: "게임 포스터",
    date: "2024.08.15",
    image: "night-blue",
  },
  {
    id: "8",
    title: "스타라이트 하이라이트 썸네일",
    description:
      "라이브 방송 하이라이트 썸네일 시리즈입니다. 통일된 컬러 팔레트로 브랜딩했습니다.",
    category: "유튜브 디자인",
    date: "2024.07.22",
    image: "youtube",
  },
  {
    id: "9",
    title: "스타라이트 채널 배너",
    description:
      "게임 공략 채널용 채널아트입니다. 별과 그라데이션 배경으로 시각적 임팩트를 주었습니다.",
    category: "포토광장",
    date: "2024.07.10",
    image: "starry-night",
  },
  {
    id: "10",
    title: "여름 축제 포토광장",
    description:
      "시즌 이벤트 포토광장 배경 작업입니다. 밝고 화사한 색감으로 축제 분위기를 표현했습니다.",
    category: "포토광장",
    date: "2024.06.18",
    image: "photo",
  },
  {
    id: "11",
    title: "실버 나이트 길드마크",
    description:
      "PvP 길드 전용 로고 디자인입니다. 메탈릭 질감과 심플한 실루엣으로 제작했습니다.",
    category: "길드마크",
    date: "2024.06.02",
    image: "guild",
  },
  {
    id: "12",
    title: "디스코드 이모지 팩",
    description:
      "커뮤니티 전용 이모지 및 스티커 세트입니다. 캐릭터 기반의 다양한 표정을 제작했습니다.",
    category: "캐릭터 디자인",
    date: "2024.05.20",
    image: "cute-purple",
  },
  {
    id: "13",
    title: "크리스탈 레전드 포스터",
    description:
      "모바일 RPG 런칭 프로모션 포스터입니다. 크리스탈과 캐릭터를 중심으로 화려한 비주얼을 구성했습니다.",
    category: "게임 포스터",
    date: "2024.05.08",
    image: "purple-girl",
  },
  {
    id: "14",
    title: "보스 레이드 썸네일",
    description:
      "레이드 공략 영상용 썸네일입니다. 보스 실루엣과 임팩트 있는 타이포로 시선을 끌었습니다.",
    category: "유튜브 디자인",
    date: "2024.04.22",
    image: "youtube",
  },
  {
    id: "15",
    title: "봄맞이 포토광장",
    description:
      "봄 시즌 이벤트용 포토광장 배경입니다. 벚꽃과 파스텔 톤으로 따뜻한 분위기를 연출했습니다.",
    category: "포토광장",
    date: "2024.04.10",
    image: "photo",
  },
  {
    id: "16",
    title: "불꽃 길드 엠블럼",
    description:
      "PvE 길드 전용 마크입니다. 불꽃 모티프와 강렬한 레드·퍼플 조합으로 제작했습니다.",
    category: "길드마크",
    date: "2024.03.28",
    image: "guild",
  },
];

/** @deprecated use seedPortfolioItems or portfolio store */
export const portfolioItems = seedPortfolioItems;

export type PortfolioItemInput = Omit<PortfolioItem, "id" | "date"> & {
  id?: string;
  date?: string;
};
