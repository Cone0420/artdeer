import { readStyleMemoryProfile, type StyleMemoryProfile } from "./style-memory";

export type StyleGenerationContext = {
  isLoaded: boolean;
  tonePatterns: string[];
  frequentWords: string[];
  sentencePatterns: string[];
  categoryIntros: Record<string, string[]>;
};

const EMPTY_CONTEXT: StyleGenerationContext = {
  isLoaded: false,
  tonePatterns: [],
  frequentWords: [],
  sentencePatterns: [],
  categoryIntros: {},
};

function profileToContext(profile: StyleMemoryProfile | null): StyleGenerationContext {
  if (!profile) return EMPTY_CONTEXT;

  return {
    isLoaded: true,
    tonePatterns: profile.tonePatterns,
    frequentWords: profile.frequentWords,
    sentencePatterns: profile.sentencePatterns,
    categoryIntros: profile.categoryIntros,
  };
}

export function getStyleContextForGeneration(): StyleGenerationContext {
  return profileToContext(readStyleMemoryProfile());
}

/** 향후 AI 제목 생성에서 사용할 컨텍스트 */
export function getStyleContextForTitleGeneration(): StyleGenerationContext {
  return getStyleContextForGeneration();
}

/** 향후 AI 태그 생성에서 사용할 컨텍스트 */
export function getStyleContextForTagGeneration(): StyleGenerationContext {
  return getStyleContextForGeneration();
}
