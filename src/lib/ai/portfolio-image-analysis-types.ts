export type PortfolioImageMood =
  | "pastel"
  | "cute"
  | "dark"
  | "gothic"
  | "vibrant"
  | "soft"
  | "neutral";

export type PortfolioImageOrientation = "portrait" | "landscape" | "square";

export type PortfolioImageAnalysis = {
  width: number;
  height: number;
  aspectRatio: number;
  orientation: PortfolioImageOrientation;
  brightness: number;
  saturation: number;
  isDark: boolean;
  isPastel: boolean;
  mood: PortfolioImageMood;
  dominantColors: string[];
  colorNames: string[];
  decorHints: string[];
  objectHints: string[];
  purposeHints: string[];
};

export const MOOD_LABELS: Record<PortfolioImageMood, string> = {
  pastel: "파스텔",
  cute: "귀여운",
  dark: "다크",
  gothic: "고딕",
  vibrant: "선명한",
  soft: "소프트",
  neutral: "",
};

export function getMoodLabelKo(mood: PortfolioImageMood): string {
  const labels: Record<PortfolioImageMood, string> = {
    pastel: "파스텔",
    cute: "귀여운",
    dark: "다크",
    gothic: "고딕",
    vibrant: "선명한",
    soft: "소프트",
    neutral: "",
  };
  return labels[mood];
}
