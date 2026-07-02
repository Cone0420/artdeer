import { AdminPortfolioManager } from "@/components/Admin/AdminPortfolioManager";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "포트폴리오",
  path: "/admin/portfolio",
  noIndex: true,
});

export default function AdminPortfolioPage() {
  return <AdminPortfolioManager />;
}
