import { seedCategories } from "@/lib/categories-data";

export type PriceSettings = {
  categoryId: string;
  price: string;
  features: string[];
  buttonsEnabled: boolean;
};

export const seedPriceSettings: PriceSettings[] = [
  {
    categoryId: "1",
    price: "80,000원~",
    features: [
      "고퀄리티 일러스트",
      "캐릭터 / 배경 포함",
      "상업적 사용 가능",
      "사이즈 자유",
    ],
    buttonsEnabled: true,
  },
  {
    categoryId: "2",
    price: "30,000원~",
    features: [
      "썸네일 / 배너 디자인",
      "눈에 띄는 디자인",
      "텍스트 포함",
      "1280x720px",
    ],
    buttonsEnabled: true,
  },
  {
    categoryId: "3",
    price: "20,000원~",
    features: ["고품질 사진 보정", "분위기 있는 필터", "맞춤형 레이아웃", "빠른 작업 속도"],
    buttonsEnabled: true,
  },
  {
    categoryId: "4",
    price: "40,000원~",
    features: ["길드 로고 디자인", "심볼 / 엠블럼 제작", "다양한 시안 제공", "고해상도 파일"],
    buttonsEnabled: true,
  },
  {
    categoryId: "5",
    price: "협의",
    features: ["캐릭터 일러스트", "전신 / 반신 제작", "상업적 사용 가능", "맞춤 제작"],
    buttonsEnabled: true,
  },
  {
    categoryId: "6",
    price: "협의",
    features: ["아이콘 / 로고", "트위치 / 디코 / 오버레이", "인포그래픽 등", "맞춤 제작"],
    buttonsEnabled: true,
  },
];

export type PriceSettingsInput = Partial<Omit<PriceSettings, "categoryId">>;

export type PriceListItem = {
  categoryId: string;
  title: string;
  subtitle: string;
  icon: import("@/lib/categories-data").CategoryIconId;
  price: string;
  features: string[];
  buttonsEnabled: boolean;
};

export function normalizeFeatures(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((line) => String(line).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return [];
}

export function featuresToTextarea(features: string[]): string {
  return features.join("\n");
}

export function textareaToFeatures(value: string): string[] {
  return normalizeFeatures(value);
}

export const priceCategoryIds = seedCategories.map((category) => category.id);
