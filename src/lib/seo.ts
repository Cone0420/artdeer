import type { Metadata } from "next";
import { getSiteUrl, siteConfig } from "@/lib/site-config";

const { ogImage } = siteConfig;

/** Shared OG/Twitter image — public/og-image.png */
export const defaultOgImage = {
  url: ogImage.path,
  width: ogImage.width,
  height: ogImage.height,
  alt: ogImage.alt,
  type: ogImage.type,
} as const;

/**
 * Root metadata (app/layout.tsx only).
 * Do not duplicate on the home page or in opengraph-image.tsx / twitter-image.tsx.
 */
export const rootMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.seoTitle,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.shortName,
  authors: [{ name: siteConfig.shortName, url: siteConfig.url }],
  creator: siteConfig.shortName,
  publisher: siteConfig.shortName,
  keywords: [...siteConfig.keywords],
  category: "design",
  alternates: {
    canonical: getSiteUrl("/"),
    languages: { "ko-KR": getSiteUrl("/") },
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: getSiteUrl("/"),
    siteName: siteConfig.shortName,
    title: siteConfig.seoTitle,
    description: siteConfig.description,
    images: [defaultOgImage],
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    title: siteConfig.seoTitle,
    description: siteConfig.description,
    images: [ogImage.path],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
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

type PageSeoOptions = {
  title: string;
  description?: string;
  path: string;
  noIndex?: boolean;
  ogImage?: string;
};

/** Child-page metadata overrides (merged with rootMetadata in layout). */
export function createPageMetadata({
  title,
  description = siteConfig.description,
  path,
  noIndex = false,
  ogImage: ogImagePath = ogImage.path,
}: PageSeoOptions): Metadata {
  const url = getSiteUrl(path);
  const ogTitle = `${title} | ${siteConfig.shortName}`;
  const imageMeta = {
    ...defaultOgImage,
    url: ogImagePath,
    alt: ogTitle,
  };

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      url,
      title: ogTitle,
      description,
      images: [imageMeta],
    },
    twitter: {
      title: ogTitle,
      description,
      images: [ogImagePath],
    },
    ...(noIndex
      ? {
          robots: {
            index: false,
            follow: false,
            googleBot: { index: false, follow: false },
          },
        }
      : {}),
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
      image: getSiteUrl(ogImage.path),
      areaServed: "KR",
      serviceType: "Game Graphic Design",
      sameAs: [],
    },
  ];
}

/** @deprecated Use rootMetadata in app/layout.tsx */
export function createRootMetadata(): Metadata {
  return rootMetadata;
}
