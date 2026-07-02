import type { Metadata } from "next";
import { getSiteUrl, siteConfig } from "@/lib/site-config";

type PageSeoOptions = {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  ogImage?: string;
};

const defaultOgImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: siteConfig.name,
  type: "image/png",
} as const;

export function createRootMetadata(): Metadata {
  const url = getSiteUrl("/");

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${siteConfig.name} - ${siteConfig.tagline}`,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    applicationName: siteConfig.shortName,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    keywords: [...siteConfig.keywords],
    category: "design",
    alternates: {
      canonical: url,
      languages: { "ko-KR": url },
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url,
      siteName: siteConfig.name,
      title: `${siteConfig.name} - ${siteConfig.tagline}`,
      description: siteConfig.description,
      images: [defaultOgImage],
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.twitterHandle,
      creator: siteConfig.twitterHandle,
      title: `${siteConfig.name} - ${siteConfig.tagline}`,
      description: siteConfig.description,
      images: ["/twitter-image"],
    },
    icons: {
      icon: [
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    manifest: "/site.webmanifest",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    other: {
      "mobile-web-app-capable": "yes",
    },
  };
}

export function createPageMetadata({
  title,
  description = siteConfig.description,
  path = "",
  noIndex = false,
  ogImage = "/opengraph-image",
}: PageSeoOptions): Metadata {
  const isHome = !path || path === "/";
  const url = getSiteUrl(isHome ? "/" : path);
  const pageTitle = isHome ? `${siteConfig.name} - ${siteConfig.tagline}` : title;
  const ogTitle = isHome ? pageTitle : `${title} | ${siteConfig.name}`;

  return {
    title: isHome ? pageTitle : title,
    description,
    keywords: [...siteConfig.keywords],
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url,
      siteName: siteConfig.name,
      title: ogTitle,
      description,
      images: [{ ...defaultOgImage, url: ogImage, alt: ogTitle }],
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.twitterHandle,
      creator: siteConfig.twitterHandle,
      title: ogTitle,
      description,
      images: [ogImage === "/opengraph-image" ? "/twitter-image" : ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}

export function createJsonLd() {
  const url = siteConfig.url;

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.name,
      description: siteConfig.description,
      url,
      inLanguage: "ko-KR",
      potentialAction: {
        "@type": "SearchAction",
        target: `${getSiteUrl("/portfolio")}?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: siteConfig.name,
      description: siteConfig.description,
      url,
      image: getSiteUrl("/opengraph-image"),
      areaServed: "KR",
      serviceType: "Game Graphic Design",
      sameAs: [],
    },
  ];
}
