import { AdminReviewsManager } from "@/components/Admin/AdminReviewsManager";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "후기 관리",
  path: "/admin/reviews",
  noIndex: true,
});

export default function AdminReviewsPage() {
  return <AdminReviewsManager />;
}
