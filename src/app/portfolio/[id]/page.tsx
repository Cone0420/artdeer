import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { PublicPageShell } from "@/components/layout/public-page-shell";
import { PageBackground } from "@/components/ui/page-background";
import { PortfolioDetail } from "@/components/Portfolio/PortfolioDetail";
import { createPageMetadata } from "@/lib/seo";
import {
  getServerPortfolioItemById,
} from "@/lib/portfolio-server";

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
  const item = await getServerPortfolioItemById(id);

  if (!item) {
    return createPageMetadata({
      title: "작품을 찾을 수 없음",
      description: "요청하신 포트폴리오 작품을 찾을 수 없습니다.",
      path: `/portfolio/${id}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: item.title,
    description: `${item.description} · ${item.category} · ${item.date}`,
    path: `/portfolio/${id}`,
  });
}

export default async function PortfolioDetailPage({ params }: PageProps) {
  const { id } = await params;
  const item = await getServerPortfolioItemById(id);

  if (!item) {
    notFound();
  }

  return (
    <>
      <PageBackground />
      <PublicPageShell>
        <Header />
        <main id="main-content">
          <PortfolioDetail id={id} initialItem={item} />
        </main>
        <Footer />
      </PublicPageShell>
    </>
  );
}
