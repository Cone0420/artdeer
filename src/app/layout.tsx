import { InitialLoadingProvider } from "@/components/ui/initial-loading-screen";
import { createJsonLd, rootMetadata } from "@/lib/seo";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = rootMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#8B7CFF",
};

const PRETENDARD_WOFF2 =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/woff2/PretendardVariable.woff2";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = createJsonLd();

  return (
    <html lang="ko" className="h-full overflow-x-hidden antialiased">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link
          rel="preload"
          href={PRETENDARD_WOFF2}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="min-h-full overflow-x-hidden flex flex-col bg-background text-foreground">
        {jsonLd.map((schema, index) => (
          <Script
            key={`json-ld-${index}`}
            id={`json-ld-${index}`}
            type="application/ld+json"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-artdear-purple focus:px-4 focus:py-2 focus:text-white"
        >
          본문으로 건너뛰기
        </a>
        <InitialLoadingProvider>{children}</InitialLoadingProvider>
      </body>
    </html>
  );
}
