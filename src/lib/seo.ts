import type { Metadata } from "next";
import { getSiteUrl, METADATA_BASE, siteConfig } from "@/lib/site-config";

const { ogImage } = siteConfig;

/** Shared OG/Twitter image — public/og-image.png */
export const defaultOgImage = {
  url: ogImage.path,
  width: ogImage.width,
  height: ogImage.height,
  alt: ogImage.alt,
  type: ogImage.type,
} as const;

function buildVerification(): Metadata["verification"] {
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  const naver = process.env.NAVER_SITE_VERIFICATION?.trim();

  if (!google && !naver) return undefined;

  return {
    ...(google ? { google } : {}),
    ...(naver ? { other: { "naver-site-verification": naver } } : {}),
  };
}

/**
 * Root metadata (app/layout.tsx only).
 * All URLs use https://artdeer.art (metadataBase, canonical, sitemap, robots).
 */
export const rootMetadata: Metadata = {
  metadataBase: new URL(METADATA_BASE),
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
      { url: "/favicon.ico", sizes: "any" },
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
  verification: buildVerification(),
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
      type: "website",
      locale: siteConfig.locale,
      url,
      siteName: siteConfig.shortName,
      title: ogTitle,
      description,
      images: [imageMeta],
    },
    twitter: {
      card: "summary_large_image",
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
  const canonicalUrl = siteConfig.url;
  const organizationId = `${METADATA_BASE}/#organization`;
  const websiteId = `${canonicalUrl}/#website`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": organizationId,
      name: siteConfig.shortName,
      legalName: siteConfig.name,
      url: canonicalUrl,
      logo: `${METADATA_BASE}${ogImage.path}`,
      image: `${METADATA_BASE}${ogImage.path}`,
      description: siteConfig.description,
      areaServed: {
        "@type": "Country",
        name: "KR",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": websiteId,
      name: siteConfig.seoTitle,
      alternateName: siteConfig.name,
      description: siteConfig.description,
      url: canonicalUrl,
      inLanguage: "ko-KR",
      publisher: { "@id": organizationId },
      potentialAction: {
        "@type": "SearchAction",
        target: `${getSiteUrl("/portfolio")}?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];
}

/** @deprecated Use rootMetadata in app/layout.tsx */
export function createRootMetadata(): Metadata {
  return rootMetadata;
}
