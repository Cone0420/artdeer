"use client";

import { FormEvent, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import {
  formatReviewDate,
  formatReviewDisplayDate,
  inputValueToReviewDate,
  maskReviewNickname,
  reviewDateToInputValue,
  type ReviewItem,
} from "@/lib/reviews-data";
import { useReviews } from "@/hooks/use-reviews-store";
import { createReview, deleteReview, toggleReviewVisibility, updateReview } from "@/lib/reviews-store";

const inputClass =
  "h-11 w-full rounded-[14px] border border-artdear-border-strong bg-background px-4 text-[14px] text-artdear-text outline-none transition-colors duration-300 focus:border-artdear-purple focus:ring-2 focus:ring-artdear-purple/20";

type FormState = {
  nickname: string;
  text: string;
  dateInput: string;
  rating: number;
  visible: boolean;
};

function createEmptyForm(): FormState {
  const today = formatReviewDate();
  return {
    nickname: "",
    text: "",
    dateInput: reviewDateToInputValue(today),
    rating: 5,
    visible: true,
  };
}

function ReviewFormModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  initial?: ReviewItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(() =>
    initial
      ? {
          nickname: initial.nickname,
          text: initial.text,
          dateInput: reviewDateToInputValue(initial.date),
          rating: initial.rating,
          visible: initial.visible,
        }
      : createEmptyForm()
  );
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.nickname.trim()) {
      setError("닉네임을 입력해주세요.");
      return;
    }
    if (!form.text.trim()) {
      setError("후기 내용을 입력해주세요.");
      return;
    }
    if (!form.dateInput) {
      setError("작성일을 입력해주세요.");
      return;
    }

    const payload = {
      nickname: form.nickname.trim(),
      text: form.text.trim(),
      date: inputValueToReviewDate(form.dateInput),
      rating: form.rating,
      visible: form.visible,
    };

    try {
      if (mode === "create") {
        await createReview(payload);
      } else if (initial) {
        await updateReview(initial.id, payload);
      }

      onSaved();
      onClose();
    } catch {
      setError("저장에 실패했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-[520px] overflow-y-auto rounded-[22px] bg-artdear-card p-6 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.25)] sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-artdear-text">
            {mode === "create" ? "후기 추가" : "후기 수정"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-artdear-text-subtle hover:bg-artdear-panel"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="rv-nick" className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted">
              작성자
            </label>
            <input
              id="rv-nick"
              value={form.nickname}
              onChange={(e) => setForm((p) => ({ ...p, nickname: e.target.value }))}
              className={inputClass}
            />
            {form.nickname.trim() ? (
              <p className="mt-1.5 text-[12px] text-artdear-text-light">
                화면 표시:{" "}
                <span className="font-medium text-artdear-text-subtle">
                  {maskReviewNickname(form.nickname)}
                </span>
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="rv-text" className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted">
              후기 내용
            </label>
            <textarea
              id="rv-text"
              rows={5}
              value={form.text}
              onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
              className="w-full resize-none rounded-[14px] border border-artdear-border-strong bg-background px-4 py-3 text-[14px] text-artdear-text outline-none focus:border-artdear-purple focus:ring-2 focus:ring-artdear-purple/20"
            />
          </div>

          <div>
            <label htmlFor="rv-date" className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted">
              작성일
            </label>
            <input
              id="rv-date"
              type="date"
              value={form.dateInput}
              onChange={(e) => setForm((p) => ({ ...p, dateInput: e.target.value }))}
              className={inputClass}
            />
            <p className="mt-1.5 text-[12px] text-artdear-text-light">
              YYYY.MM.DD 형식으로 저장됩니다.
            </p>
          </div>

          <div>
            <label htmlFor="rv-rating" className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted">
              별점
            </label>
            <select
              id="rv-rating"
              value={form.rating}
              onChange={(e) => setForm((p) => ({ ...p, rating: Number(e.target.value) }))}
              className={inputClass}
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n}점
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-[14px] border border-artdear-border-card bg-artdear-panel px-4 py-3">
            <input
              type="checkbox"
              checked={form.visible}
              onChange={(e) => setForm((p) => ({ ...p, visible: e.target.checked }))}
              className="size-4 rounded accent-artdear-purple"
            />
            <span className="text-[14px] font-medium text-artdear-text">홈페이지에 표시</span>
          </label>

          {error ? (
            <p className="text-[13px] text-red-500" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="h-11 w-full rounded-full bg-artdear-purple text-[15px] font-semibold text-white shadow-[var(--shadow-artdear-btn)] hover:bg-artdear-purple-dark"
          >
            저장
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminReviewsManager() {
  const { items, ready, refresh } = useReviews();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<ReviewItem | null>(null);

  const handleDelete = async (item: ReviewItem) => {
    if (!confirm(`"${maskReviewNickname(item.nickname)}" 후기를 삭제하시겠습니까?`)) return;
    try {
      await deleteReview(item.id);
      await refresh();
    } catch {
      alert("삭제에 실패했습니다.");
    }
  };

  const handleToggleVisible = async (id: string) => {
    try {
      await toggleReviewVisibility(id);
      await refresh();
    } catch {
      alert("상태 변경에 실패했습니다.");
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-artdear-text">후기 관리</h1>
          <p className="mt-1 text-[14px] text-artdear-text-subtle">
            등록된 후기 {ready ? items.length : "-"}개 · 작성일 최신순
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setModal("create");
          }}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-artdear-purple px-5 text-[14px] font-semibold text-white shadow-[var(--shadow-artdear-btn)] hover:bg-artdear-purple-dark"
        >
          <Plus className="size-4" />
          추가
        </button>
      </div>

      <div className="mt-8 overflow-hidden rounded-[22px] border border-artdear-border-card bg-artdear-card shadow-[var(--shadow-artdear-card)]">
        {!ready ? (
          <p className="px-6 py-12 text-center text-[14px] text-artdear-text-subtle">불러오는 중...</p>
        ) : items.length === 0 ? (
          <p className="px-6 py-12 text-center text-[14px] text-artdear-text-subtle">
            등록된 후기가 없습니다.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-[13px]">
              <thead className="border-b border-artdear-border-card bg-artdear-panel">
                <tr>
                  <th className="px-6 py-3 font-semibold text-artdear-text-muted">작성자</th>
                  <th className="px-6 py-3 font-semibold text-artdear-text-muted">후기</th>
                  <th className="px-6 py-3 font-semibold text-artdear-text-muted">별점</th>
                  <th className="px-6 py-3 font-semibold text-artdear-text-muted">표시</th>
                  <th className="px-6 py-3 font-semibold text-artdear-text-muted">작성일</th>
                  <th className="px-6 py-3 font-semibold text-artdear-text-muted">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-artdear-border-card">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-artdear-panel">
                    <td className="px-6 py-3 font-medium text-artdear-text">
                      {maskReviewNickname(item.nickname)}
                    </td>
                    <td className="max-w-[320px] px-6 py-3 text-artdear-text-subtle">
                      <p className="line-clamp-2">{item.text}</p>
                    </td>
                    <td className="px-6 py-3 text-artdear-purple">{item.rating}점</td>
                    <td className="px-6 py-3">
                      <button
                        type="button"
                        onClick={() => handleToggleVisible(item.id)}
                        className={
                          item.visible
                            ? "rounded-full bg-artdear-purple-light px-2.5 py-1 text-[11px] font-semibold text-artdear-purple"
                            : "rounded-full bg-artdear-panel px-2.5 py-1 text-[11px] font-semibold text-artdear-text-light"
                        }
                      >
                        {item.visible ? "표시" : "숨김"}
                      </button>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-artdear-text-subtle">
                      {formatReviewDisplayDate(item.date)}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(item);
                            setModal("edit");
                          }}
                          className="flex size-8 items-center justify-center rounded-[10px] text-artdear-purple hover:bg-artdear-purple-light"
                          aria-label="수정"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="flex size-8 items-center justify-center rounded-[10px] text-red-500 hover:bg-red-50"
                          aria-label="삭제"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal ? (
        <ReviewFormModal
          mode={modal}
          initial={editing ?? undefined}
          onClose={() => {
            setModal(null);
            setEditing(null);
          }}
          onSaved={refresh}
        />
      ) : null}
    </div>
  );
}
