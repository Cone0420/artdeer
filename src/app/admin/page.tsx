import { AdminRootRedirect } from "@/components/Admin/AdminRootRedirect";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "관리자",
  description: "아트디어 관리자",
  path: "/admin",
  noIndex: true,
});

export default function AdminPage() {
  return <AdminRootRedirect />;
}
