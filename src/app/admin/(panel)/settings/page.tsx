import { AdminSettings } from "@/components/Admin/AdminSettings";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "설정",
  path: "/admin/settings",
  noIndex: true,
});

export default function AdminSettingsPage() {
  return <AdminSettings />;
}
