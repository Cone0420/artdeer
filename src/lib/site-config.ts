/** Canonical production URL (Gabia → Vercel custom domain). */
export const DEFAULT_SITE_URL = "https://www.artdeer.art";

function normalizeSiteUrl(url: string) {
  return url.replace(/\/$/, "");
}

export const siteConfig = {
  name: "아트디어 Art Deer",
  shortName: "ART Deer",
  seoTitle: "ART Deer - 게임 · 방송 · 커뮤니티 디자인 전문",
  tagline: "게임 · 방송 · 커뮤니티 디자인 전문",
  description: "게임 · 방송 · 커뮤니티 디자인 전문 플랫폼 ART Deer.",
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL),
  locale: "ko_KR",
  ogImage: {
    path: "/og-image.png",
    width: 1200,
    height: 630,
    alt: "ART Deer",
    type: "image/png",
  },
  keywords: [
    "게임 디자인",
    "게임 포스터",
    "유튜브 디자인",
    "유튜브 썸네일",
    "캐릭터 디자인",
    "길드마크",
    "포토광장",
    "방송 디자인",
    "커뮤니티 디자인",
    "아트디어",
    "ART Deer",
  ],
  twitterHandle: "@artdeer",
} as const;

export function getSiteUrl(path = "") {
  const base = siteConfig.url;
  const normalized = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `${base}${normalized}`;
}
