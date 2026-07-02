"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { DeerLogoIcon } from "@/components/icons/brand-icons";
import { adminApiErrorMessage, loginAdminApi } from "@/lib/api/admin-users-client";
import { isAdminAuthenticated, setAdminSessionToken } from "@/lib/admin-auth";

export function AdminLogin() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminAuthenticated()) {
      router.replace("/admin/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const trimmedId = id.trim().toLowerCase();

    try {
      const { token } = await loginAdminApi(trimmedId, password);
      setAdminSessionToken(token);
      router.replace("/admin/dashboard");
    } catch (err) {
      setError(adminApiErrorMessage(err instanceof Error ? err.message : "invalid_credentials"));
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-[420px] rounded-[22px] border border-artdear-border-card bg-artdear-card p-8 shadow-[var(--shadow-artdear-card)] transition-colors duration-300 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <DeerLogoIcon className="size-12" />
          <h1 className="mt-4 text-[22px] font-bold text-artdear-text">관리자</h1>
          <p className="mt-1 text-[14px] text-artdear-text-subtle">아트디어 관리자 로그인</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="admin-id" className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted">
              아이디
            </label>
            <input
              id="admin-id"
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              autoComplete="username"
              required
              className="h-11 w-full rounded-[14px] border border-artdear-border-strong bg-background px-4 text-[14px] text-artdear-text outline-none transition-colors duration-300 focus:border-artdear-purple focus:ring-2 focus:ring-artdear-purple/20"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted"
            >
              비밀번호
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="h-11 w-full rounded-[14px] border border-artdear-border-strong bg-background px-4 text-[14px] text-artdear-text outline-none transition-colors duration-300 focus:border-artdear-purple focus:ring-2 focus:ring-artdear-purple/20"
            />
          </div>

          {error ? (
            <p className="text-[13px] text-red-500" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-11 w-full rounded-full bg-artdear-purple text-[15px] font-semibold text-white shadow-[var(--shadow-artdear-btn)] transition-all duration-300 hover:bg-artdear-purple-dark disabled:opacity-60"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
