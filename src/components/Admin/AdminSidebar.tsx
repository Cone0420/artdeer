"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DeerLogoIcon } from "@/components/icons/brand-icons";
import { adminNavItems } from "@/lib/admin-data";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-[240px] shrink-0 flex-col border-r border-artdear-border-card bg-artdear-card transition-colors duration-300">
      <div className="flex items-center gap-2.5 border-b border-artdear-border-card px-6 py-5">
        <DeerLogoIcon className="size-9" />
        <div>
          <p className="text-[15px] font-bold text-artdear-purple">Art Deer</p>
          <p className="text-[10px] font-medium tracking-[0.1em] text-artdear-text-light">관리자</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {adminNavItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-[12px] px-4 py-2.5 text-[14px] font-medium transition-colors duration-300",
                active
                  ? "bg-artdear-purple-light text-artdear-purple"
                  : "text-artdear-text-subtle hover:bg-artdear-panel hover:text-artdear-purple"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
