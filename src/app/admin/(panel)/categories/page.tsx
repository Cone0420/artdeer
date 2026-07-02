import { AdminCategoriesManager } from "@/components/Admin/AdminCategoriesManager";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "카테고리 관리",
  description: "아트디어 카테고리 관리",
  path: "/admin/categories",
  noIndex: true,
});

export default function AdminCategoriesPage() {
  return <AdminCategoriesManager />;
}
