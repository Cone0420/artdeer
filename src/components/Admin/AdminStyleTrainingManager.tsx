"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { AdminToast } from "@/components/ui/admin-toast";
import {
  fetchStyleMemoryStatus,
  styleMemoryErrorMessage,
  trainStyleMemoryApi,
  type StyleMemoryStatusResponse,
} from "@/lib/api/style-memory-client";

function StatusStat({
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

export function AdminStyleTrainingManager() {
  const [status, setStatus] = useState<StyleMemoryStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  }, []);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const next = await fetchStyleMemoryStatus();
      setStatus(next);
    } catch (err) {
      setError(styleMemoryErrorMessage(err instanceof Error ? err.message : "request_failed"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const handleTrain = async () => {
    setTraining(true);
    setProgress(8);
    setError("");

    const progressTimer = window.setInterval(() => {
      setProgress((prev) => (prev >= 92 ? prev : prev + Math.random() * 14));
    }, 180);

    try {
      const result = await trainStyleMemoryApi();
      setProgress(100);
      setStatus(result);
      showToast("Art Deer 스타일 학습이 완료되었습니다.");
    } catch (err) {
      setError(styleMemoryErrorMessage(err instanceof Error ? err.message : "training_failed"));
    } finally {
      window.clearInterval(progressTimer);
      window.setTimeout(() => {
        setTraining(false);
        setProgress(0);
      }, 500);
    }
  };

  const profile = status?.profile;

  return (
    <div>
      <p className="text-[12px] font-semibold tracking-[0.16em] text-artdear-purple">AI STYLE TRAINING</p>
      <h1 className="mt-2 text-[24px] font-bold text-artdear-text">AI 스타일 학습</h1>
      <p className="mt-1 max-w-2xl text-[14px] leading-relaxed text-artdear-text-subtle">
        현재 등록된 포트폴리오를 분석하여 Art Deer만의 문체와 설명 스타일을 생성합니다.
      </p>

      {status?.needsRetrain ? (
        <div className="mt-6 rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
          새로운 포트폴리오가 추가되었습니다. 최신 데이터 기준으로 다시 학습하시겠습니까?
        </div>
      ) : null}

      <section className="mt-8 rounded-[22px] border border-artdear-border-card bg-artdear-card shadow-[0_4px_24px_-10px_rgba(0,0,0,0.06)]">
        <div className="border-b border-artdear-border-card px-4 py-4 sm:px-6">
          <h2 className="text-[16px] font-bold text-artdear-text">현재 상태</h2>
        </div>

        <div className="space-y-6 p-4 sm:p-6">
          <div className="rounded-[18px] border border-artdear-border-card bg-artdear-panel p-4 sm:p-5">
            <p className="text-[13px] font-semibold text-artdear-text-muted">학습 상태</p>
            <div className="mt-3 flex items-center gap-3">
              {loading ? (
                <Loader2 className="size-5 animate-spin text-artdear-purple" aria-hidden="true" />
              ) : status?.isTrained ? (
                <>
                  <span className="inline-flex size-3 rounded-full bg-emerald-500" aria-hidden="true" />
                  <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-emerald-700">
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                    학습 완료
                  </span>
                </>
              ) : (
                <>
                  <span className="inline-flex size-3 rounded-full border-2 border-artdear-text-light" aria-hidden="true" />
                  <span className="text-[15px] font-semibold text-artdear-text-subtle">미학습</span>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[92px] animate-pulse rounded-[18px] border border-artdear-border-card bg-artdear-panel"
                />
              ))
            ) : (
              <>
                <StatusStat
                  label="마지막 학습일"
                  value={status?.trainedAt ?? "-"}
                />
                <StatusStat
                  label="분석한 포트폴리오"
                  value={status?.portfolioCount ?? 0}
                  unit="개"
                />
                <StatusStat label="분석한 태그" value={status?.tagCount ?? 0} unit="개" />
                <StatusStat
                  label="분석한 카테고리"
                  value={status?.categoryCount ?? 0}
                  unit="개"
                />
              </>
            )}
          </div>

          {training ? (
            <div className="rounded-[18px] border border-artdear-border-card bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[13px] font-medium text-artdear-text-muted">포트폴리오 분석 중...</p>
                <span className="text-[13px] font-semibold text-artdear-purple">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-artdear-panel">
                <div
                  className="h-full rounded-full bg-artdear-purple transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => void handleTrain()}
            disabled={training || loading}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-artdear-purple px-6 text-[14px] font-semibold text-white shadow-[var(--shadow-artdear-btn)] transition-colors hover:bg-artdear-purple-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {training ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <span aria-hidden="true">🧠</span>
            )}
            스타일 학습 시작
          </button>

          {error ? <p className="text-[13px] text-red-600">{error}</p> : null}
        </div>
      </section>

      {profile ? (
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[22px] border border-artdear-border-card bg-artdear-card p-5 shadow-[var(--shadow-artdear-card)]">
            <h3 className="text-[15px] font-bold text-artdear-text">문체</h3>
            <ul className="mt-4 space-y-2">
              {profile.tonePatterns.slice(0, 8).map((pattern) => (
                <li
                  key={pattern}
                  className="rounded-[12px] bg-artdear-panel px-3 py-2 text-[13px] text-artdear-text-subtle"
                >
                  {pattern}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[22px] border border-artdear-border-card bg-artdear-card p-5 shadow-[var(--shadow-artdear-card)]">
            <h3 className="text-[15px] font-bold text-artdear-text">자주 사용하는 단어</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.frequentWords.slice(0, 16).map((word) => (
                <span
                  key={word}
                  className="rounded-full border border-artdear-border-strong bg-artdear-purple-light px-3 py-1 text-[12px] font-medium text-artdear-purple"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] border border-artdear-border-card bg-artdear-card p-5 shadow-[var(--shadow-artdear-card)] lg:col-span-2">
            <h3 className="text-[15px] font-bold text-artdear-text">자주 사용하는 문장 패턴</h3>
            <ul className="mt-4 space-y-2">
              {profile.sentencePatterns.slice(0, 8).map((sentence) => (
                <li
                  key={sentence}
                  className="rounded-[12px] border border-artdear-border-card bg-white px-3 py-2 text-[13px] leading-relaxed text-artdear-text-subtle"
                >
                  {sentence}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <AdminToast
        message={toastMessage}
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
}
