import type { ReactNode } from "react";

/**
 * Public pages wrap Header / main / Footer.
 * Ensures full viewport width on mobile (avoids shrink-to-fit / grid column squeeze).
 */
export function PublicPageShell({ children }: { children: ReactNode }) {
  return <div className="relative z-10 w-full min-w-0">{children}</div>;
}
