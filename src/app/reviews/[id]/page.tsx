import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { PageBackground } from "@/components/ui/page-background";
import { ReviewDetail } from "@/components/Reviews/ReviewDetail";
import { createPageMetadata } from "@/lib/seo";
import { getServerReviewById, getServerReviewIds } from "@/lib/reviews-server";
import { maskReviewNickname } from "@/lib/reviews-data";

const Footer = dynamic(
  () => import("@/components/Footer").then((m) => ({ default: m.Footer })),
  { loading: () => null }
);

type PageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return getServerReviewIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = getServerReviewById(id);

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
  const item = getServerReviewById(id);

  if (!item) {
    notFound();
  }

  return (
    <>
      <PageBackground />
      <div className="relative z-10">
        <Header />
        <main id="main-content">
          <ReviewDetail id={id} />
        </main>
        <Footer />
      </div>
    </>
  );
}
