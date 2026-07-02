import { AdminAccountsManager } from "@/components/Admin/AdminAccountsManager";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "관리자 관리",
  path: "/admin/accounts",
  noIndex: true,
});

export default function AdminAccountsPage() {
  return <AdminAccountsManager />;
}
