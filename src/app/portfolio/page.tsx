import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { PageBackground } from "@/components/ui/page-background";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "포트폴리오",
  description: "아트디어가 제작한 게임, 방송, 커뮤니티 디자인 포트폴리오",
  path: "/portfolio",
});

const Footer = dynamic(
  () => import("@/components/Footer").then((m) => ({ default: m.Footer })),
  { loading: () => null }
);

const Portfolio = dynamic(
  () => import("@/components/Portfolio").then((m) => ({ default: m.Portfolio })),
  { loading: () => null }
);

export default function PortfolioPage() {
  return (
    <>
      <PageBackground />
      <div className="relative z-10">
        <Header />
        <main id="main-content">
          <Suspense fallback={null}>
            <Portfolio />
          </Suspense>
        </main>
        <Footer />
      </div>
    </>
  );
}
