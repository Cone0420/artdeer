"use client";

import { FormEvent, useState } from "react";
import { Pencil, X } from "lucide-react";
import {
  featuresToTextarea,
  textareaToFeatures,
  type PriceListItem,
} from "@/lib/price-data";
import { usePriceListItems } from "@/hooks/use-price-store";
import { updatePriceSettings } from "@/lib/price-store";
import { CategoryIconPreview } from "@/components/icons/category-icons";

const inputClass =
  "h-11 w-full rounded-[14px] border border-artdear-border-strong bg-background px-4 text-[14px] text-artdear-text outline-none transition-colors duration-300 focus:border-artdear-purple focus:ring-2 focus:ring-artdear-purple/20";

function PriceEditModal({
  item,
  onClose,
  onSaved,
}: {
  item: PriceListItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [price, setPrice] = useState(item.price);
  const [featuresText, setFeaturesText] = useState(featuresToTextarea(item.features));
  const [buttonsEnabled, setButtonsEnabled] = useState(item.buttonsEnabled);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!price.trim()) {
      setError("가격을 입력해주세요.");
      return;
    }

    try {
      await updatePriceSettings(item.categoryId, {
        price: price.trim(),
        features: textareaToFeatures(featuresText),
        buttonsEnabled,
      });
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
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CategoryIconPreview icon={item.icon} className="size-14 shrink-0 rounded-[14px] bg-[#faf8ff]" />
            <div>
              <h2 className="text-[18px] font-bold text-artdear-text">{item.title}</h2>
              <p className="mt-0.5 text-[12px] text-artdear-text-subtle">{item.subtitle}</p>
              <p className="mt-1 text-[11px] text-artdear-text-light">
                카테고리명·이미지는 DESIGN PORTFOLIO에서 관리됩니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-artdear-text-subtle hover:bg-artdear-panel"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="pr-price" className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted">
              가격
            </label>
            <input
              id="pr-price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="예: 80,000원~"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="pr-features" className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted">
              추가 설명
            </label>
            <textarea
              id="pr-features"
              rows={5}
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              placeholder={"고퀄리티 일러스트\n캐릭터 / 배경 포함\n상업적 사용 가능\n사이즈 자유"}
              className="w-full resize-none rounded-[14px] border border-artdear-border-strong bg-background px-4 py-3 text-[14px] text-artdear-text outline-none focus:border-artdear-purple focus:ring-2 focus:ring-artdear-purple/20"
            />
            <p className="mt-1.5 text-[12px] text-artdear-text-light">한 줄에 하나씩 입력해주세요.</p>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-[14px] border border-artdear-border-card bg-artdear-panel px-4 py-3">
            <input
              type="checkbox"
              checked={buttonsEnabled}
              onChange={(e) => setButtonsEnabled(e.target.checked)}
              className="size-4 rounded accent-artdear-purple"
            />
            <span className="text-[14px] font-medium text-artdear-text">문의 버튼 표시</span>
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

export function AdminPriceManager() {
  const { items, ready, refresh } = usePriceListItems();
  const [editing, setEditing] = useState<PriceListItem | null>(null);

  return (
    <div>
      <div>
        <h1 className="text-[24px] font-bold text-artdear-text">가격표</h1>
        <p className="mt-1 text-[14px] text-artdear-text-subtle">
          DESIGN PORTFOLIO 카테고리와 연동됩니다. 가격, 추가 설명, 문의 버튼만 수정할 수 있습니다.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-[22px] border border-artdear-border-card bg-artdear-card shadow-[var(--shadow-artdear-card)]">
        {!ready ? (
          <p className="px-6 py-12 text-center text-[14px] text-artdear-text-subtle">불러오는 중...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead className="border-b border-artdear-border-card bg-artdear-panel">
                <tr>
                  <th className="px-6 py-3 font-semibold text-artdear-text-muted">카테고리</th>
                  <th className="px-6 py-3 font-semibold text-artdear-text-muted">가격</th>
                  <th className="px-6 py-3 font-semibold text-artdear-text-muted">추가 설명</th>
                  <th className="px-6 py-3 font-semibold text-artdear-text-muted">버튼</th>
                  <th className="px-6 py-3 font-semibold text-artdear-text-muted">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-artdear-border-card">
                {items.map((item) => (
                  <tr key={item.categoryId} className="hover:bg-artdear-panel">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <CategoryIconPreview icon={item.icon} className="size-10 shrink-0 rounded-[10px] bg-[#faf8ff]" />
                        <div>
                          <p className="font-medium text-artdear-text">{item.title}</p>
                          <p className="text-[11px] text-artdear-text-light">{item.subtitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 font-semibold text-artdear-purple">{item.price}</td>
                    <td className="max-w-[240px] truncate px-6 py-3 text-artdear-text-subtle">
                      {item.features.join(" · ")}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={
                          item.buttonsEnabled
                            ? "font-medium text-artdear-purple"
                            : "text-artdear-text-light"
                        }
                      >
                        {item.buttonsEnabled ? "표시" : "숨김"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <button
                        type="button"
                        onClick={() => setEditing(item)}
                        className="flex size-8 items-center justify-center rounded-[10px] text-artdear-purple hover:bg-artdear-purple-light"
                        aria-label="수정"
                      >
                        <Pencil className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing ? (
        <PriceEditModal item={editing} onClose={() => setEditing(null)} onSaved={refresh} />
      ) : null}
    </div>
  );
}
