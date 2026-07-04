/** Canonical production URL (Gabia → Vercel custom domain). */
export const DEFAULT_SITE_URL = "https://www.artdeer.art";

function normalizeSiteUrl(url: string) {
  return url.replace(/\/$/, "");
}

export const siteConfig = {
  name: "아트디어 Art Deer",
  shortName: "Art Deer",
  tagline: "GAME GRAPHIC DESIGN STUDIO",
  description:
    "게임, 방송, 커뮤니티까지 — 상상하는 모든 디자인을 제작하는 아트디어 게임 그래픽 디자인 스튜디오",
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL),
  locale: "ko_KR",
  keywords: [
    "게임 디자인",
    "게임 포스터",
    "유튜브 썸네일",
    "채널아트",
    "길드마크",
    "게임 그래픽",
    "아트디어",
    "Art Deer",
  ],
  twitterHandle: "@artdeer",
} as const;

export function getSiteUrl(path = "") {
  const base = siteConfig.url;
  const normalized = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `${base}${normalized}`;
}
