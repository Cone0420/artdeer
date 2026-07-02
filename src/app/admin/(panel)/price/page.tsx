import { AdminPriceManager } from "@/components/Admin/AdminPriceManager";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "가격표",
  path: "/admin/price",
  noIndex: true,
});

export default function AdminPricePage() {
  return <AdminPriceManager />;
}
