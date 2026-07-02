"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  getSettings,
  saveSettings,
  SETTINGS_UPDATED_EVENT,
} from "@/lib/settings-store";
import type { SiteSettings } from "@/lib/settings-data";

const inputClass =
  "h-11 w-full rounded-[14px] border border-artdear-border-strong bg-background px-4 text-[14px] text-artdear-text outline-none transition-colors duration-300 focus:border-artdear-purple focus:ring-2 focus:ring-artdear-purple/20";

const fields: {
  id: keyof SiteSettings;
  label: string;
  placeholder: string;
  type?: string;
  optional?: boolean;
}[] = [
  {
    id: "discordLink",
    label: "디스코드 초대 링크",
    placeholder: "https://discord.gg/...",
  },
  {
    id: "kakaoLink",
    label: "카카오 오픈채팅 링크",
    placeholder: "https://open.kakao.com/...",
  },
  {
    id: "email",
    label: "이메일",
    placeholder: "contact@artdeer.com",
    type: "email",
  },
  {
    id: "phone",
    label: "전화번호 (선택)",
    placeholder: "010-0000-0000",
    type: "tel",
    optional: true,
  },
];

export function AdminSettings() {
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setForm(await getSettings());
      } catch {
        setForm(null);
      }
    };

    void load();
    const onUpdate = () => void load();
    window.addEventListener(SETTINGS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(SETTINGS_UPDATED_EVENT, onUpdate);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;

    try {
      const current = await getSettings();
      await saveSettings({ ...current, ...form });
      setSaved(true);
      setError("");
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("저장에 실패했습니다.");
    }
  };

  if (!form) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-2 border-artdear-purple border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-[24px] font-bold text-artdear-text">설정</h1>
      <p className="mt-1 text-[14px] text-artdear-text-subtle">
        홈페이지 링크 및 연락처를 관리합니다.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-5">
        {fields.map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id} className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted">
              {field.label}
            </label>
            <input
              id={field.id}
              type={field.type ?? "text"}
              value={form[field.id]}
              onChange={(e) => setForm((prev) => (prev ? { ...prev, [field.id]: e.target.value } : prev))}
              placeholder={field.placeholder}
              className={inputClass}
            />
          </div>
        ))}

        {error ? (
          <p className="text-[13px] text-red-500" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="h-11 rounded-full bg-artdear-purple px-8 text-[15px] font-semibold text-white shadow-[var(--shadow-artdear-btn)] hover:bg-artdear-purple-dark"
        >
          {saved ? "저장됨" : "저장"}
        </button>
      </form>
    </div>
  );
}
