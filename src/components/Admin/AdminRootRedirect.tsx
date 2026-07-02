"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export function AdminRootRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(isAdminAuthenticated() ? "/admin/dashboard" : "/admin/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background transition-colors duration-300">
      <div className="size-8 animate-spin rounded-full border-2 border-artdear-purple border-t-transparent" />
    </div>
  );
}
