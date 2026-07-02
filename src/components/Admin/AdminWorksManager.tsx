"use client";

import { FormEvent, useState } from "react";
import { ChevronDown, Pencil, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  workStatusColors,
  workStatusLabels,
  workStatusOrder,
  type WorkItem,
  type WorkStatus,
} from "@/lib/work-data";
import { useWorks } from "@/hooks/use-work-store";
import { createWork, deleteWork, updateWork, updateWorkStatus } from "@/lib/work-store";

const inputClass =
  "h-11 w-full rounded-[14px] border border-artdear-border-strong bg-background px-4 text-[14px] text-artdear-text outline-none transition-colors duration-300 focus:border-artdear-purple focus:ring-2 focus:ring-artdear-purple/20";

type FormState = {
  clientName: string;
  title: string;
  category: string;
  note: string;
};

const emptyForm: FormState = {
  clientName: "",
  title: "",
  category: "",
  note: "",
};

function WorkStatusStepper({
  status,
  onChange,
}: {
  status: WorkStatus;
  onChange: (status: WorkStatus) => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      {workStatusOrder.map((step, index) => {
        const active = status === step;
        const passed = workStatusOrder.indexOf(status) > index;

        return (
          <div key={step} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChange(step)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-all duration-300 sm:text-[13px]",
                active
                  ? workStatusColors[step]
                  : passed
                    ? "border-artdear-border-strong bg-artdear-panel text-artdear-text-muted hover:border-artdear-purple hover:text-artdear-purple"
                    : "border-artdear-border-card bg-background text-artdear-text-light hover:border-artdear-purple hover:text-artdear-purple"
              )}
            >
              {workStatusLabels[step]}
            </button>
            {index < workStatusOrder.length - 1 ? (
              <ChevronDown className="hidden size-4 rotate-[-90deg] text-artdear-text-light sm:block" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function WorkFormModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  initial?: WorkItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(() =>
    initial
      ? {
          clientName: initial.clientName,
          title: initial.title,
          category: initial.category,
          note: initial.note ?? "",
        }
      : emptyForm
  );
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.clientName.trim()) {
      setError("의뢰인명을 입력해주세요.");
      return;
    }
    if (!form.title.trim()) {
      setError("작업명을 입력해주세요.");
      return;
    }
    if (!form.category.trim()) {
      setError("카테고리를 입력해주세요.");
      return;
    }

    const payload = {
      clientName: form.clientName.trim(),
      title: form.title.trim(),
      category: form.category.trim(),
      note: form.note.trim() || undefined,
      status: initial?.status,
    };

    try {
      if (mode === "create") {
        await createWork(payload);
      } else if (initial) {
        await updateWork(initial.id, payload);
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
            {mode === "create" ? "작업 추가" : "작업 수정"}
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
            <label htmlFor="work-client" className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted">
              의뢰인
            </label>
            <input
              id="work-client"
              value={form.clientName}
              onChange={(e) => setForm((prev) => ({ ...prev, clientName: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="work-title" className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted">
              작업명
            </label>
            <input
              id="work-title"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="work-category" className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted">
              카테고리
            </label>
            <input
              id="work-category"
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="work-note" className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted">
              메모
            </label>
            <textarea
              id="work-note"
              rows={3}
              value={form.note}
              onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
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
            {mode === "create" ? "추가" : "저장"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminWorksManager() {
  const { items, ready, refresh } = useWorks();
  const [modal, setModal] = useState<"create" | { edit: WorkItem } | null>(null);

  const sortedItems = [...items].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-artdear-text">작업 관리</h1>
          <p className="mt-1 text-[14px] text-artdear-text-subtle">
            상담중 → 작업중 → 수정중 → 완료
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal("create")}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-artdear-purple px-5 text-[14px] font-semibold text-white shadow-[var(--shadow-artdear-btn)] hover:bg-artdear-purple-dark"
        >
          <Plus className="size-4" />
          작업 추가
        </button>
      </div>

      <div className="mt-8 space-y-4">
        {!ready ? (
          <p className="py-12 text-center text-[14px] text-artdear-text-subtle">불러오는 중...</p>
        ) : sortedItems.length === 0 ? (
          <p className="py-12 text-center text-[14px] text-artdear-text-subtle">등록된 작업이 없습니다.</p>
        ) : (
          sortedItems.map((item) => (
            <div
              key={item.id}
              className="rounded-[22px] border border-artdear-border-card bg-artdear-card p-5 shadow-[0_4px_24px_-10px_rgba(0,0,0,0.06)] sm:p-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[16px] font-bold text-artdear-text">{item.title}</p>
                    <span className="rounded-full bg-artdear-purple-light px-2.5 py-0.5 text-[11px] font-medium text-artdear-purple">
                      {item.category}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] text-artdear-text-subtle">
                    의뢰인: <span className="font-medium text-artdear-text">{item.clientName}</span>
                  </p>
                  {item.note ? (
                    <p className="mt-2 text-[13px] leading-relaxed text-artdear-text-subtle">{item.note}</p>
                  ) : null}
                  <time className="mt-2 block text-[12px] text-artdear-text-light">{item.date}</time>
                </div>

                <div className="flex shrink-0 items-center gap-2 self-start">
                  <button
                    type="button"
                    onClick={() => setModal({ edit: item })}
                    className="flex size-9 items-center justify-center rounded-full border border-artdear-border-strong text-artdear-text-subtle hover:border-artdear-purple hover:text-artdear-purple"
                    aria-label="수정"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("이 작업을 삭제할까요?")) {
                        void (async () => {
                          try {
                            await deleteWork(item.id);
                            await refresh();
                          } catch {
                            alert("삭제에 실패했습니다.");
                          }
                        })();
                      }
                    }}
                    className="flex size-9 items-center justify-center rounded-full border border-artdear-border-strong text-artdear-text-subtle hover:border-red-400 hover:text-red-500"
                    aria-label="삭제"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="mt-5 border-t border-artdear-border-card pt-5">
                <p className="mb-3 text-[12px] font-semibold tracking-[0.08em] text-artdear-text-light">
                  작업 상태
                </p>
                <WorkStatusStepper
                  status={item.status}
                  onChange={(status) => {
                    void (async () => {
                      try {
                        await updateWorkStatus(item.id, status);
                        await refresh();
                      } catch {
                        alert("상태 변경에 실패했습니다.");
                      }
                    })();
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {modal === "create" ? (
        <WorkFormModal mode="create" onClose={() => setModal(null)} onSaved={refresh} />
      ) : modal && typeof modal === "object" ? (
        <WorkFormModal
          mode="edit"
          initial={modal.edit}
          onClose={() => setModal(null)}
          onSaved={refresh}
        />
      ) : null}
    </div>
  );
}
