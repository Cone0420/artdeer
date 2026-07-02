"use client";

import { useVisitorStats } from "@/hooks/use-visitor-stats";
import { formatDuration } from "@/lib/analytics/format-duration";

function AnalyticsStatCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number;
  unit?: string;
}) {
  return (
    <div className="rounded-[18px] border border-artdear-border-card bg-gradient-to-br from-white to-[#faf8ff] p-4 shadow-[0_4px_20px_-12px_rgba(139,124,255,0.18)] sm:p-5">
      <p className="text-[12px] font-semibold tracking-[0.08em] text-artdear-text-light">{label}</p>
      <p className="mt-2 text-[24px] font-bold leading-tight text-artdear-purple sm:text-[28px]">
        {typeof value === "number" ? value.toLocaleString("ko-KR") : value}
        {unit ? (
          <span className="ml-1 text-[13px] font-semibold text-artdear-text-subtle sm:text-[14px]">
            {unit}
          </span>
        ) : null}
      </p>
    </div>
  );
}

export function AdminDashboard() {
  const { stats, ready: statsReady, error: statsError, refresh } = useVisitorStats();

  return (
    <div>
      <h1 className="text-[24px] font-bold text-artdear-text">대시보드</h1>
      <p className="mt-1 text-[14px] text-artdear-text-subtle">홈페이지 방문 및 체류 통계</p>

      <section className="mt-8 rounded-[22px] border border-artdear-border-card bg-artdear-card shadow-[0_4px_24px_-10px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-3 border-b border-artdear-border-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-[16px] font-bold text-artdear-text">방문 통계</h2>
            <p className="mt-0.5 text-[12px] text-artdear-text-light">
              홈페이지 접속 기준 · 세션 30분 내 중복 집계 제외
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            className="self-start rounded-full border border-artdear-border-strong px-3 py-1.5 text-[12px] font-medium text-artdear-purple transition-colors hover:bg-artdear-purple-light sm:self-auto"
          >
            새로고침
          </button>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-6 lg:grid-cols-3 xl:grid-cols-6">
          {!statsReady ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[92px] animate-pulse rounded-[18px] border border-artdear-border-card bg-artdear-panel"
              />
            ))
          ) : statsError ? (
            <p className="col-span-full px-2 py-6 text-center text-[13px] text-artdear-text-subtle">
              {statsError}
            </p>
          ) : (
            <>
              <AnalyticsStatCard label="오늘 방문자" value={stats.visits.today} unit="명" />
              <AnalyticsStatCard label="최근 7일" value={stats.visits.week} unit="명" />
              <AnalyticsStatCard label="최근 30일" value={stats.visits.month} unit="명" />
              <AnalyticsStatCard label="올해" value={stats.visits.year} unit="명" />
              <AnalyticsStatCard label="전체 방문자" value={stats.visits.total} unit="명" />
              <AnalyticsStatCard
                label="평균 체류 시간"
                value={formatDuration(stats.duration.total)}
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}
