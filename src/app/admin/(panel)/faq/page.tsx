import { AdminFaqManager } from "@/components/Admin/AdminFaqManager";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "FAQ 관리",
  path: "/admin/faq",
  noIndex: true,
});

export default function AdminFaqPage() {
  return <AdminFaqManager />;
}
