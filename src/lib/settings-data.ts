export type SiteSettings = {
  discordLink: string;
  kakaoLink: string;
  email: string;
  phone: string;
};

export const defaultSettings: SiteSettings = {
  discordLink: "https://discord.gg/",
  kakaoLink: "https://open.kakao.com/",
  email: "contact@artdeer.com",
  phone: "",
};

export function normalizeSettings(raw: Partial<SiteSettings> | null | undefined): SiteSettings {
  return {
    discordLink: raw?.discordLink?.trim() || defaultSettings.discordLink,
    kakaoLink: raw?.kakaoLink?.trim() || defaultSettings.kakaoLink,
    email: raw?.email?.trim() || defaultSettings.email,
    phone: raw?.phone?.trim() ?? defaultSettings.phone,
  };
}

export function mailtoHref(email: string) {
  const value = email.trim();
  if (!value) return "#";
  return value.startsWith("mailto:") ? value : `mailto:${value}`;
}

export function telHref(phone: string) {
  const value = phone.trim();
  if (!value) return "";
  const normalized = value.replace(/[^\d+]/g, "");
  return value.startsWith("tel:") ? value : `tel:${normalized}`;
}

export function externalHref(url: string) {
  const value = url.trim();
  return value || "#";
}
