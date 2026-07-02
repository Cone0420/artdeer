import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[14px] bg-artdear-panel",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-artdear-purple/10 before:to-transparent",
        className
      )}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[22px] border border-artdear-border-card bg-artdear-card p-5 shadow-[var(--shadow-artdear-card)]",
        className
      )}
    >
      <Skeleton className="mx-auto h-4 w-2/3" />
      <Skeleton className="mx-auto mt-2 h-3 w-1/2" />
      <Skeleton className="mt-4 aspect-[16/10] w-full rounded-[16px]" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
    </div>
  );
}

export function SkeletonCategoryCard() {
  return (
    <div
      className="category-portfolio-card mx-auto w-full max-w-[192px] rounded-[20px] border border-artdear-border-card px-3 pb-3 pt-3 shadow-[var(--shadow-artdear-card)]"
      style={{ backgroundColor: "#faf8ff" }}
    >
      <Skeleton className="category-portfolio-card__media w-full rounded-[12px]" />
      <Skeleton className="mx-auto mt-2 h-3.5 w-3/4" />
      <Skeleton className="mx-auto mt-1 h-2.5 w-1/2" />
    </div>
  );
}

export function SkeletonReviewCard() {
  return (
    <div className="rounded-[22px] border border-artdear-border-card bg-artdear-card p-5 shadow-[var(--shadow-artdear-card)]">
      <div className="flex items-start gap-3">
        <Skeleton className="size-9 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      <Skeleton className="mt-4 h-3 w-24" />
    </div>
  );
}
