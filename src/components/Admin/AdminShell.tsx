"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminLogoutButton } from "./AdminLogoutButton";
import { AdminSidebar } from "./AdminSidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.replace("/admin/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background transition-colors duration-300">
        <div className="size-8 animate-spin rounded-full border-2 border-artdear-purple border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background transition-colors duration-300">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-14 shrink-0 items-center justify-end gap-3 border-b border-artdear-border-card bg-artdear-header px-4 sm:px-6">
          <AdminLogoutButton />
        </div>
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
