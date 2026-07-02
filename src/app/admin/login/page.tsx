import { AdminLogin } from "@/components/Admin/AdminLogin";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "관리자 로그인",
  description: "아트디어 관리자 로그인",
  path: "/admin/login",
  noIndex: true,
});

export default function AdminLoginPage() {
  return <AdminLogin />;
}
