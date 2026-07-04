import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { PublicPageShell } from "@/components/layout/public-page-shell";
import { PageBackground } from "@/components/ui/page-background";
import { ReviewDetail } from "@/components/Reviews/ReviewDetail";
import { createPageMetadata } from "@/lib/seo";
import { getServerReviewById } from "@/lib/reviews-server";
import { maskReviewNickname } from "@/lib/reviews-data";

const Footer = nextDynamic(
  () => import("@/components/Footer").then((m) => ({ default: m.Footer })),
  { loading: () => null }
);

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await getServerReviewById(id);

  if (!item) {
    return createPageMetadata({
      title: "후기를 찾을 수 없음",
      description: "요청하신 후기를 찾을 수 없습니다.",
      path: `/reviews/${id}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: `${maskReviewNickname(item.nickname)}님의 후기`,
    description: item.text.slice(0, 120),
    path: `/reviews/${id}`,
  });
}

export default async function ReviewDetailPage({ params }: PageProps) {
  const { id } = await params;
  const item = await getServerReviewById(id);

  if (!item) {
    notFound();
  }

  return (
    <>
      <PageBackground />
      <PublicPageShell>
        <Header />
        <main id="main-content">
          <ReviewDetail id={id} initialItem={item} />
        </main>
        <Footer />
      </PublicPageShell>
    </>
  );
}
