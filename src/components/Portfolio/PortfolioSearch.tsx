"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { filterPortfolioItems } from "@/lib/portfolio-search";
import { usePortfolioItems } from "@/hooks/use-portfolio-store";

const inputClassName =
  "w-full rounded-full border border-artdear-border-card bg-artdear-card text-artdear-text-muted outline-none transition-[border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] placeholder:text-artdear-text-light focus:border-artdear-purple focus:shadow-[0_0_24px_rgba(139,124,255,0.16)]";

type PortfolioSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  variant?: "page" | "header" | "mobile";
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
};

export function PortfolioSearchField({
  value,
  onChange,
  variant = "page",
  className,
  inputClassName: inputClassNameProp,
  autoFocus = false,
}: PortfolioSearchFieldProps) {
  const isHeader = variant === "header";
  const isMobile = variant === "mobile";

  return (
    <div className={cn("relative", className)}>
      <Search
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-artdear-text-light",
          isHeader ? "left-3 size-4" : "left-4 size-[18px]"
        )}
        strokeWidth={2}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          isHeader
            ? "포트폴리오 검색..."
            : "제목, 설명, 카테고리, 태그로 검색..."
        }
        autoFocus={autoFocus}
        aria-label="포트폴리오 검색"
        className={cn(
          inputClassName,
          isHeader
            ? "h-9 pl-9 pr-8 text-[12px] lg:h-10 lg:pl-10 lg:pr-9 lg:text-[13px]"
            : isMobile
              ? "h-11 pl-10 pr-10 text-[13px]"
              : "h-11 pl-10 pr-4 text-[13px] sm:h-12 sm:pl-11 sm:pr-5 sm:text-[14px]",
          inputClassNameProp
        )}
      />
      {value && isHeader ? (
        <button
          type="button"
          aria-label="검색어 지우기"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-2.5 -translate-y-1/2 text-artdear-text-light hover:text-artdear-purple"
        >
          <X className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

function SearchResultsPanel({
  results,
  query,
  ready,
  onSelect,
  className,
}: {
  results: ReturnType<typeof filterPortfolioItems>;
  query: string;
  ready: boolean;
  onSelect?: () => void;
  className?: string;
}) {
  const trimmed = query.trim();

  if (!trimmed) return null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[16px] border border-artdear-border-card bg-artdear-card shadow-[var(--shadow-artdear-card-hover)]",
        className
      )}
    >
      {!ready ? (
        <p className="px-4 py-3 text-[13px] text-artdear-text-subtle">검색 중...</p>
      ) : results.length === 0 ? (
        <p className="px-4 py-3 text-[13px] text-artdear-text-subtle">검색 결과가 없습니다.</p>
      ) : (
        <ul className="max-h-[320px] overflow-y-auto py-1">
          {results.map((item) => (
            <li key={item.id}>
              <Link
                href={`/portfolio/${item.id}`}
                onClick={onSelect}
                className="block px-4 py-2.5 transition-colors hover:bg-artdear-purple-light/60"
              >
                <p className="truncate text-[13px] font-semibold text-artdear-text">{item.title}</p>
                <p className="mt-0.5 truncate text-[11px] text-artdear-purple">{item.category}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function HeaderPortfolioSearch() {
  const router = useRouter();
  const { items, ready } = usePortfolioItems();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const results = useMemo(
    () => filterPortfolioItems(items, query).slice(0, 8),
    [items, query]
  );

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setOpen(false);
    router.push(`/portfolio?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div ref={rootRef} className="relative hidden md:block">
      <form onSubmit={handleSubmit} className="w-[140px] lg:w-[180px] xl:w-[200px]">
        <PortfolioSearchField
          variant="header"
          value={query}
          onChange={(value) => {
            setQuery(value);
            setOpen(true);
          }}
        />
        <input type="submit" className="sr-only" tabIndex={-1} />
      </form>

      <AnimatePresence>
        {open && query.trim() ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[calc(100%+8px)] right-0 z-50 w-[min(92vw,280px)] lg:w-[320px]"
          >
            <SearchResultsPanel
              results={results}
              query={query}
              ready={ready}
              onSelect={() => {
                setOpen(false);
                setQuery("");
              }}
            />
            {ready && results.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push(`/portfolio?q=${encodeURIComponent(query.trim())}`);
                }}
                className="mt-2 w-full rounded-full border border-artdear-border-strong bg-artdear-btn-secondary py-2 text-[12px] font-medium text-artdear-text-muted transition-colors hover:border-artdear-purple hover:text-artdear-purple"
              >
                전체 결과 보기
              </button>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function MobileMenuPortfolioSearch({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const { items, ready } = usePortfolioItems();
  const [query, setQuery] = useState("");

  const results = useMemo(
    () => filterPortfolioItems(items, query).slice(0, 6),
    [items, query]
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    onNavigate?.();
    router.push(`/portfolio?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="border-b border-artdear-border px-4 py-4 sm:px-5">
      <form onSubmit={handleSubmit}>
        <PortfolioSearchField
          variant="mobile"
          value={query}
          onChange={setQuery}
        />
      </form>
      {query.trim() ? (
        <div className="mt-3">
          <SearchResultsPanel
            results={results}
            query={query}
            ready={ready}
            onSelect={onNavigate}
            className="border-none shadow-none"
          />
        </div>
      ) : null}
    </div>
  );
}
