import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { Header } from "@/components/Header";
import { PublicPageShell } from "@/components/layout/public-page-shell";
import { Hero } from "@/components/Hero";
import { VisitorTracker } from "@/components/analytics/visitor-tracker";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { createPageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: siteConfig.tagline,
  description: siteConfig.description,
  path: "",
});

const PageBackground = dynamic(
  () => import("@/components/ui/page-background").then((m) => ({ default: m.PageBackground })),
  { ssr: true }
);

const Categories = dynamic(
  () => import("@/components/Categories").then((m) => ({ default: m.Categories })),
  { loading: () => null }
);

const RecentWorks = dynamic(
  () => import("@/components/RecentWorks").then((m) => ({ default: m.RecentWorks })),
  { loading: () => null }
);

const Faq = dynamic(
  () => import("@/components/Faq").then((m) => ({ default: m.Faq })),
  { loading: () => null }
);

const PriceList = dynamic(
  () => import("@/components/PriceList").then((m) => ({ default: m.PriceList })),
  { loading: () => null }
);

const Reviews = dynamic(
  () => import("@/components/Reviews").then((m) => ({ default: m.Reviews })),
  { loading: () => null }
);

const HowToOrder = dynamic(
  () => import("@/components/HowToOrder").then((m) => ({ default: m.HowToOrder })),
  { loading: () => null }
);

const Footer = dynamic(
  () => import("@/components/Footer").then((m) => ({ default: m.Footer })),
  { loading: () => null }
);

/** Home sections after RECENT WORKS — order controls render sequence. */
const homeSections: { id: string; Component: ComponentType }[] = [
  { id: "price", Component: PriceList },
  { id: "faq", Component: Faq },
  { id: "reviews", Component: Reviews },
  { id: "contact", Component: HowToOrder },
];

export default function Home() {
  return (
    <>
      <VisitorTracker />
      <CustomCursor />
      <PageBackground />
      <PublicPageShell>
        <Header />
        <main id="main-content">
          <Hero />
          <Categories />
          <RecentWorks />
          {homeSections.map(({ id, Component }) => (
            <Component key={id} />
          ))}
        </main>
        <Footer />
      </PublicPageShell>
    </>
  );
}
