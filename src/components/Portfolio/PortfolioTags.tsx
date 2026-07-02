import { cn } from "@/lib/utils";
import { normalizePortfolioTags } from "@/lib/portfolio-tags";

export function PortfolioTags({
  tags,
  className,
  size = "sm",
  maxVisible,
}: {
  tags?: string[] | null;
  className?: string;
  size?: "sm" | "md";
  maxVisible?: number;
}) {
  const normalized = normalizePortfolioTags(tags ?? []);
  if (normalized.length === 0) return null;

  const visibleTags =
    typeof maxVisible === "number" ? normalized.slice(0, maxVisible) : normalized;
  const hiddenCount =
    typeof maxVisible === "number" ? Math.max(0, normalized.length - maxVisible) : 0;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {visibleTags.map((tag) => (
        <span
          key={tag}
          className={cn(
            "inline-flex items-center rounded-full bg-artdear-purple-light font-medium text-artdear-purple",
            size === "sm"
              ? "px-2 py-0.5 text-[10px] sm:text-[11px]"
              : "px-2.5 py-1 text-[11px] sm:text-[12px]"
          )}
        >
          #{tag}
        </span>
      ))}
      {hiddenCount > 0 ? (
        <span className="text-[10px] font-medium text-artdear-text-light sm:text-[11px]">
          +{hiddenCount}
        </span>
      ) : null}
    </div>
  );
}
