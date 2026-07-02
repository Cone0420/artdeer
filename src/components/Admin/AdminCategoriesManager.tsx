"use client";

import { FormEvent, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  categoryIconOptions,
  type CategoryIconId,
  type CategoryItem,
} from "@/lib/categories-data";
import { useCategories } from "@/hooks/use-categories-store";
import {
  createCategory,
  deleteCategory,
  reorderCategory,
  updateCategory,
} from "@/lib/categories-store";
import { CategoryIconPreview } from "@/components/icons/category-icons";

const inputClass =
  "h-11 w-full rounded-[14px] border border-artdear-border-strong bg-background px-4 text-[14px] text-artdear-text outline-none transition-colors duration-300 focus:border-artdear-purple focus:ring-2 focus:ring-artdear-purple/20";

type FormState = {
  title: string;
  subtitle: string;
  icon: CategoryIconId;
};

const emptyForm: FormState = {
  title: "",
  subtitle: "",
  icon: "game-poster",
};

function CategoryFormModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  initial?: CategoryItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(() =>
    initial
      ? { title: initial.title, subtitle: initial.subtitle, icon: initial.icon }
      : emptyForm
  );
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("카테고리명을 입력해주세요.");
      return;
    }
    if (!form.subtitle.trim()) {
      setError("영문 부제를 입력해주세요.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      icon: form.icon,
    };

    try {
      if (mode === "create") {
        await createCategory(payload);
      } else if (initial) {
        await updateCategory(initial.id, payload);
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
      <div className="relative z-10 w-full max-w-[480px] rounded-[22px] bg-artdear-card p-6 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.25)] sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-artdear-text">
            {mode === "create" ? "카테고리 추가" : "카테고리 수정"}
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
            <label htmlFor="cat-title" className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted">
              카테고리명
            </label>
            <input
              id="cat-title"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="cat-sub" className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted">
              영문 부제
            </label>
            <input
              id="cat-sub"
              value={form.subtitle}
              onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
              placeholder="GAME POSTER"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="cat-icon" className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted">
              아이콘
            </label>
            <select
              id="cat-icon"
              value={form.icon}
              onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value as CategoryIconId }))}
              className={inputClass}
            >
              {categoryIconOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <CategoryIconPreview
              icon={form.icon}
              className="mt-3 flex h-[100px] items-center justify-center rounded-[14px] bg-artdear-purple-soft"
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

export function AdminCategoriesManager() {
  const { items, ready, refresh } = useCategories();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<CategoryItem | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 카테고리를 삭제하시겠습니까?`)) return;
    try {
      await deleteCategory(id);
      await refresh();
    } catch {
      alert("삭제에 실패했습니다.");
    }
  };

  const handleReorder = async (id: string, direction: "up" | "down") => {
    try {
      await reorderCategory(id, direction);
      await refresh();
    } catch {
      alert("순서 변경에 실패했습니다.");
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-artdear-text">카테고리</h1>
          <p className="mt-1 text-[14px] text-artdear-text-subtle">
            홈페이지 디자인 카테고리 {ready ? items.length : "-"}개
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
            등록된 카테고리가 없습니다.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead className="border-b border-artdear-border-card bg-artdear-panel">
                <tr>
                  <th className="px-6 py-3 font-semibold text-artdear-text-muted">순서</th>
                  <th className="px-6 py-3 font-semibold text-artdear-text-muted">아이콘</th>
                  <th className="px-6 py-3 font-semibold text-artdear-text-muted">카테고리</th>
                  <th className="px-6 py-3 font-semibold text-artdear-text-muted">영문 부제</th>
                  <th className="px-6 py-3 font-semibold text-artdear-text-muted">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-artdear-border-card">
                {items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-artdear-panel">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleReorder(item.id, "up")}
                          className="flex size-7 items-center justify-center rounded-[8px] text-artdear-purple hover:bg-artdear-purple-light disabled:opacity-30"
                          aria-label="위로"
                        >
                          <ArrowUp className="size-4" />
                        </button>
                        <button
                          type="button"
                          disabled={index === items.length - 1}
                          onClick={() => handleReorder(item.id, "down")}
                          className="flex size-7 items-center justify-center rounded-[8px] text-artdear-purple hover:bg-artdear-purple-light disabled:opacity-30"
                          aria-label="아래로"
                        >
                          <ArrowDown className="size-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <CategoryIconPreview
                        icon={item.icon}
                        className="flex h-14 w-16 items-center justify-center rounded-[10px] bg-artdear-purple-soft"
                      />
                    </td>
                    <td className="px-6 py-3 font-medium text-artdear-text">{item.title}</td>
                    <td className="px-6 py-3 text-artdear-text-subtle">{item.subtitle}</td>
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
                          onClick={() => handleDelete(item.id, item.title)}
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
        <CategoryFormModal
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
