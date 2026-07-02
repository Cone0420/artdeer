"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { clearAdminSession } from "@/lib/admin-auth";

export function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    clearAdminSession();
    router.replace("/admin/login");
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-artdear-border-strong bg-artdear-btn-secondary px-4 text-[13px] font-medium text-artdear-text-muted transition-colors duration-300 hover:border-artdear-purple hover:bg-artdear-btn-secondary-hover hover:text-artdear-purple"
    >
      <LogOut className="size-4" />
      로그아웃
    </button>
  );
}
