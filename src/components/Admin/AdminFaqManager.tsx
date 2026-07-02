"use client";

import { FormEvent, useState } from "react";
import { GripVertical, Pencil, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FaqItem } from "@/lib/faq-data";
import { useFaqItems } from "@/hooks/use-faq-store";
import { createFaqItem, deleteFaqItem, moveFaqItem, updateFaqItem } from "@/lib/faq-store";

const inputClass =
  "h-11 w-full rounded-[14px] border border-artdear-border-strong bg-background px-4 text-[14px] text-artdear-text outline-none transition-colors duration-300 focus:border-artdear-purple focus:ring-2 focus:ring-artdear-purple/20";

type FormState = {
  question: string;
  answer: string;
};

const emptyForm: FormState = {
  question: "",
  answer: "",
};

function FaqFormModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  initial?: FaqItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(() =>
    initial ? { question: initial.question, answer: initial.answer } : emptyForm
  );
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.question.trim()) {
      setError("질문을 입력해주세요.");
      return;
    }
    if (!form.answer.trim()) {
      setError("답변을 입력해주세요.");
      return;
    }

    const payload = {
      question: form.question.trim(),
      answer: form.answer.trim(),
    };

    try {
      if (mode === "create") {
        await createFaqItem(payload);
      } else if (initial) {
        await updateFaqItem(initial.id, payload);
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
      <div className="relative z-10 max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-[22px] bg-artdear-card p-6 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.25)] sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-artdear-text">
            {mode === "create" ? "FAQ 추가" : "FAQ 수정"}
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
            <label htmlFor="faq-question" className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted">
              질문
            </label>
            <input
              id="faq-question"
              value={form.question}
              onChange={(e) => setForm((prev) => ({ ...prev, question: e.target.value }))}
              placeholder="예: 작업 기간은 얼마나 걸리나요?"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="faq-answer" className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted">
              답변
            </label>
            <textarea
              id="faq-answer"
              rows={6}
              value={form.answer}
              onChange={(e) => setForm((prev) => ({ ...prev, answer: e.target.value }))}
              placeholder="답변 내용을 입력해주세요. 줄바꿈으로 문단을 구분할 수 있습니다."
              className="w-full resize-none rounded-[14px] border border-artdear-border-strong bg-background px-4 py-3 text-[14px] text-artdear-text outline-none focus:border-artdear-purple focus:ring-2 focus:ring-artdear-purple/20"
            />
          </div>

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

export function AdminFaqManager() {
  const { items, ready, refresh } = useFaqItems();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDelete = async (item: FaqItem) => {
    if (!confirm(`"${item.question}" 항목을 삭제하시겠습니까?`)) return;
    try {
      await deleteFaqItem(item.id);
      await refresh();
    } catch {
      alert("삭제에 실패했습니다.");
    }
  };

  const handleDrop = async (targetId: string) => {
    if (!draggingId) return;
    try {
      await moveFaqItem(draggingId, targetId);
      setDraggingId(null);
      setDragOverId(null);
      await refresh();
    } catch {
      alert("순서 변경에 실패했습니다.");
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-artdear-text">FAQ 관리</h1>
          <p className="mt-1 text-[14px] text-artdear-text-subtle">
            홈페이지 FAQ 섹션에 표시됩니다. 드래그하여 순서를 변경할 수 있습니다.
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
          질문 추가
        </button>
      </div>

      <div className="mt-8 overflow-hidden rounded-[22px] border border-artdear-border-card bg-artdear-card shadow-[var(--shadow-artdear-card)]">
        {!ready ? (
          <p className="px-6 py-12 text-center text-[14px] text-artdear-text-subtle">불러오는 중...</p>
        ) : items.length === 0 ? (
          <p className="px-6 py-12 text-center text-[14px] text-artdear-text-subtle">
            등록된 FAQ가 없습니다.
          </p>
        ) : (
          <ul className="divide-y divide-artdear-border-card">
            {items.map((item, index) => (
              <li
                key={item.id}
                draggable
                onDragStart={() => setDraggingId(item.id)}
                onDragEnd={() => {
                  setDraggingId(null);
                  setDragOverId(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverId(item.id);
                }}
                onDragLeave={() => setDragOverId(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(item.id);
                }}
                className={cn(
                  "flex items-start gap-3 px-4 py-4 transition-colors sm:px-6",
                  draggingId === item.id && "opacity-50",
                  dragOverId === item.id && draggingId !== item.id && "bg-artdear-purple-light/40"
                )}
              >
                <button
                  type="button"
                  aria-label="순서 변경"
                  className="mt-1 flex size-8 shrink-0 cursor-grab items-center justify-center rounded-[10px] text-artdear-text-light hover:bg-artdear-panel hover:text-artdear-purple active:cursor-grabbing"
                >
                  <GripVertical className="size-4" />
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-artdear-purple">Q{index + 1}</span>
                    <p className="text-[14px] font-semibold text-artdear-text">{item.question}</p>
                  </div>
                  <p className="mt-2 line-clamp-2 whitespace-pre-line text-[13px] leading-relaxed text-artdear-text-subtle">
                    {item.answer}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
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
              </li>
            ))}
          </ul>
        )}
      </div>

      {modal ? (
        <FaqFormModal
          mode={modal}
          initial={modal === "edit" ? editing ?? undefined : undefined}
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
