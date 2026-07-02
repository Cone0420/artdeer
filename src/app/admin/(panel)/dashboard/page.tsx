import { AdminDashboard } from "@/components/Admin/AdminDashboard";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "대시보드",
  description: "아트디어 관리 대시보드",
  path: "/admin/dashboard",
  noIndex: true,
});

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
