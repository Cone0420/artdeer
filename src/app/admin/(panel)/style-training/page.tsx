import { AdminStyleTrainingManager } from "@/components/Admin/AdminStyleTrainingManager";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "AI 스타일 학습",
  path: "/admin/style-training",
  noIndex: true,
});

export default function AdminStyleTrainingPage() {
  return <AdminStyleTrainingManager />;
}
