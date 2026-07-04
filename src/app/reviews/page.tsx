import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Header } from "@/components/Header";
import { PublicPageShell } from "@/components/layout/public-page-shell";
import { PageBackground } from "@/components/ui/page-background";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "후기",
  description: "아트디어를 이용해주신 고객님들의 REAL REVIEWS",
  path: "/reviews",
});

const Footer = dynamic(
  () => import("@/components/Footer").then((m) => ({ default: m.Footer })),
  { loading: () => null }
);

const ReviewsPage = dynamic(
  () => import("@/components/Reviews/ReviewsPage").then((m) => ({ default: m.ReviewsPage })),
  { loading: () => null }
);

export default function ReviewsListPage() {
  return (
    <>
      <PageBackground />
      <PublicPageShell>
        <Header />
        <main id="main-content">
          <Suspense fallback={null}>
            <ReviewsPage />
          </Suspense>
        </main>
        <Footer />
      </PublicPageShell>
    </>
  );
}
