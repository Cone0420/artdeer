"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  adminApiErrorMessage,
  changeMyAdminPasswordApi,
  createAdminUserApi,
  deleteAdminUserApi,
  fetchAdminUsers,
  updateAdminUserApi,
} from "@/lib/api/admin-users-client";
import { getAdminUserId, isSuperAdminSession } from "@/lib/admin-auth";
import {
  adminRoleLabel,
  type AdminRole,
  type AdminUserPublic,
} from "@/lib/admin-user-types";

const inputClass =
  "h-11 w-full rounded-[14px] border border-artdear-border-strong bg-background px-4 text-[14px] text-artdear-text outline-none transition-colors duration-300 focus:border-artdear-purple focus:ring-2 focus:ring-artdear-purple/20";

function formatAdminDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PasswordChangeCard({ onSuccess }: { onSuccess?: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await changeMyAdminPasswordApi({ currentPassword, newPassword, newPasswordConfirm });
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      setSuccess("비밀번호가 변경되었습니다.");
      onSuccess?.();
    } catch (err) {
      setError(adminApiErrorMessage(err instanceof Error ? err.message : "change_failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[18px] border border-artdear-border-card bg-artdear-card p-5 shadow-[var(--shadow-artdear-card)] sm:p-6">
      <h2 className="text-[16px] font-bold text-artdear-text">내 비밀번호 변경</h2>
      <p className="mt-1 text-[13px] text-artdear-text-subtle">
        현재 로그인한 관리자 계정의 비밀번호를 변경합니다.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted">
            현재 비밀번호
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted">
            새 비밀번호
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted">
            새 비밀번호 확인
          </label>
          <input
            type="password"
            value={newPasswordConfirm}
            onChange={(e) => setNewPasswordConfirm(e.target.value)}
            autoComplete="new-password"
            required
            minLength={8}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-3 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="h-10 rounded-full bg-artdear-purple px-5 text-[14px] font-semibold text-white transition-colors hover:bg-artdear-purple-dark disabled:opacity-60"
          >
            비밀번호 변경
          </button>
          {error ? (
            <p className="text-[13px] text-red-500" role="alert">
              {error}
            </p>
          ) : null}
          {success ? <p className="text-[13px] text-artdear-purple">{success}</p> : null}
        </div>
      </form>
    </div>
  );
}

type AdminFormState = {
  username: string;
  password: string;
  passwordConfirm: string;
  displayName: string;
  role: AdminRole;
  isActive: boolean;
};

function AdminFormModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  initial?: AdminUserPublic;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isSuperAdmin = isSuperAdminSession();
  const [form, setForm] = useState<AdminFormState>(() =>
    initial
      ? {
          username: initial.username,
          password: "",
          passwordConfirm: "",
          displayName: initial.displayName ?? "",
          role: initial.role,
          isActive: initial.isActive,
        }
      : {
          username: "",
          password: "",
          passwordConfirm: "",
          displayName: "",
          role: "admin",
          isActive: true,
        }
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "create") {
        if (!form.password) {
          setError("비밀번호를 입력해주세요.");
          setLoading(false);
          return;
        }
        await createAdminUserApi({
          username: form.username.trim().toLowerCase(),
          password: form.password,
          passwordConfirm: form.passwordConfirm,
          displayName: form.displayName.trim() || undefined,
          role: form.role,
        });
      } else if (initial) {
        await updateAdminUserApi(initial.id, {
          username: isSuperAdmin ? form.username.trim().toLowerCase() : undefined,
          password: form.password || undefined,
          passwordConfirm: form.password || undefined ? form.passwordConfirm : undefined,
          displayName: form.displayName.trim() || null,
          role: isSuperAdmin ? form.role : undefined,
          isActive: isSuperAdmin ? form.isActive : undefined,
        });
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(adminApiErrorMessage(err instanceof Error ? err.message : "request_failed"));
    } finally {
      setLoading(false);
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
            {mode === "create" ? "관리자 추가" : "관리자 수정"}
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
            <label className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted">
              아이디
            </label>
            <input
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              required
              disabled={mode === "edit" && !isSuperAdmin}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted">
              {mode === "create" ? "비밀번호" : "새 비밀번호 (변경 시에만 입력)"}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              required={mode === "create"}
              minLength={mode === "create" ? 8 : undefined}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted">
              비밀번호 확인
            </label>
            <input
              type="password"
              value={form.passwordConfirm}
              onChange={(e) => setForm((prev) => ({ ...prev, passwordConfirm: e.target.value }))}
              required={mode === "create" || Boolean(form.password)}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted">
              이름 (선택)
            </label>
            <input
              value={form.displayName}
              onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))}
              className={inputClass}
            />
          </div>

          {isSuperAdmin && mode === "create" ? (
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted">
                권한
              </label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, role: e.target.value as AdminRole }))
                }
                className={inputClass}
              >
                <option value="admin">관리자</option>
                <option value="super_admin">최고 관리자</option>
              </select>
            </div>
          ) : null}

          {isSuperAdmin && mode === "edit" ? (
            <>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-artdear-text-muted">
                  권한
                </label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, role: e.target.value as AdminRole }))
                  }
                  className={inputClass}
                >
                  <option value="admin">관리자</option>
                  <option value="super_admin">최고 관리자</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-[14px] text-artdear-text">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="size-4 rounded border-artdear-border-strong text-artdear-purple focus:ring-artdear-purple/20"
                />
                활성 계정
              </label>
            </>
          ) : null}

          {error ? (
            <p className="text-[13px] text-red-500" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-full border border-artdear-border-strong px-5 text-[14px] font-medium text-artdear-text-muted hover:bg-artdear-panel"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-10 rounded-full bg-artdear-purple px-5 text-[14px] font-semibold text-white hover:bg-artdear-purple-dark disabled:opacity-60"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({
  user,
  onClose,
  onConfirm,
}: {
  user: AdminUserPublic;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(adminApiErrorMessage(err instanceof Error ? err.message : "delete_failed"));
    } finally {
      setLoading(false);
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
      <div className="relative z-10 w-full max-w-[420px] rounded-[22px] bg-artdear-card p-6 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.25)] sm:p-8">
        <h2 className="text-[18px] font-bold text-artdear-text">관리자 삭제</h2>
        <p className="mt-3 text-[14px] leading-relaxed text-artdear-text-subtle">
          <span className="font-semibold text-artdear-text">{user.username}</span> 계정을
          정말 삭제하시겠습니까?
        </p>
        {error ? (
          <p className="mt-3 text-[13px] text-red-500" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-full border border-artdear-border-strong px-5 text-[14px] font-medium text-artdear-text-muted hover:bg-artdear-panel"
          >
            취소
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className="h-10 rounded-full bg-red-500 px-5 text-[14px] font-semibold text-white hover:bg-red-600 disabled:opacity-60"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminAccountsManager() {
  const [users, setUsers] = useState<AdminUserPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<null | { mode: "create" } | { mode: "edit"; user: AdminUserPublic }>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<AdminUserPublic | null>(null);
  const [error, setError] = useState("");

  const currentUserId = getAdminUserId();
  const isSuperAdmin = isSuperAdminSession();

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch (err) {
      setError(adminApiErrorMessage(err instanceof Error ? err.message : "request_failed"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(query) ||
        (user.displayName?.toLowerCase().includes(query) ?? false)
    );
  }, [search, users]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-artdear-text">관리자 관리</h1>
          <p className="mt-1 text-[14px] text-artdear-text-subtle">
            관리자 계정 생성, 수정, 삭제 및 권한을 관리합니다.
          </p>
        </div>
        {isSuperAdmin ? (
          <button
            type="button"
            onClick={() => setModal({ mode: "create" })}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-artdear-purple px-5 text-[14px] font-semibold text-white shadow-[var(--shadow-artdear-btn)] transition-colors hover:bg-artdear-purple-dark"
          >
            <Plus className="size-4" />
            관리자 추가
          </button>
        ) : null}
      </div>

      <PasswordChangeCard />

      <div className="rounded-[18px] border border-artdear-border-card bg-artdear-card shadow-[var(--shadow-artdear-card)]">
        <div className="flex flex-col gap-3 border-b border-artdear-border-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <h2 className="text-[16px] font-bold text-artdear-text">관리자 목록</h2>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-artdear-text-light" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="아이디 또는 이름 검색"
              className="h-10 w-full rounded-full border border-artdear-border-strong bg-background pl-9 pr-4 text-[13px] text-artdear-text outline-none focus:border-artdear-purple focus:ring-2 focus:ring-artdear-purple/20"
            />
          </div>
        </div>

        {error ? (
          <p className="p-5 text-[13px] text-red-500" role="alert">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="size-8 animate-spin rounded-full border-2 border-artdear-purple border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-artdear-border-card bg-artdear-panel/60 text-artdear-text-muted">
                  <th className="px-5 py-3 font-semibold">아이디</th>
                  <th className="px-5 py-3 font-semibold">이름</th>
                  <th className="px-5 py-3 font-semibold">권한</th>
                  <th className="px-5 py-3 font-semibold">생성일</th>
                  <th className="px-5 py-3 font-semibold">최근 로그인</th>
                  <th className="px-5 py-3 font-semibold">상태</th>
                  <th className="px-5 py-3 font-semibold text-right">관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const isSelf = user.id === currentUserId;
                  const canManage = isSuperAdmin || isSelf;

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-artdear-border-card last:border-b-0"
                    >
                      <td className="px-5 py-4 font-medium text-artdear-text">
                        {user.username}
                        {isSelf ? (
                          <span className="ml-2 text-[11px] font-normal text-artdear-purple">
                            (나)
                          </span>
                        ) : null}
                      </td>
                      <td className="px-5 py-4 text-artdear-text-subtle">
                        {user.displayName || "-"}
                      </td>
                      <td className="px-5 py-4 text-artdear-text-subtle">
                        {adminRoleLabel(user.role)}
                      </td>
                      <td className="px-5 py-4 text-artdear-text-subtle">
                        {formatAdminDate(user.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-artdear-text-subtle">
                        {formatAdminDate(user.lastLoginAt)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
                            user.isActive
                              ? "bg-artdear-purple-light text-artdear-purple"
                              : "bg-artdear-panel text-artdear-text-light"
                          )}
                        >
                          {user.isActive ? "활성" : "비활성"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          {canManage ? (
                            <button
                              type="button"
                              onClick={() => setModal({ mode: "edit", user })}
                              className="flex size-8 items-center justify-center rounded-full text-artdear-text-subtle hover:bg-artdear-panel hover:text-artdear-purple"
                              aria-label={`${user.username} 수정`}
                            >
                              <Pencil className="size-4" />
                            </button>
                          ) : null}
                          {isSuperAdmin && !isSelf ? (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(user)}
                              className="flex size-8 items-center justify-center rounded-full text-artdear-text-subtle hover:bg-red-50 hover:text-red-500"
                              aria-label={`${user.username} 삭제`}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredUsers.length === 0 ? (
              <p className="py-12 text-center text-[14px] text-artdear-text-subtle">
                {search.trim() ? "검색 결과가 없습니다." : "등록된 관리자가 없습니다."}
              </p>
            ) : null}
          </div>
        )}
      </div>

      {modal?.mode === "create" ? (
        <AdminFormModal mode="create" onClose={() => setModal(null)} onSaved={loadUsers} />
      ) : null}

      {modal?.mode === "edit" ? (
        <AdminFormModal
          mode="edit"
          initial={modal.user}
          onClose={() => setModal(null)}
          onSaved={loadUsers}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            await deleteAdminUserApi(deleteTarget.id);
            await loadUsers();
          }}
        />
      ) : null}
    </div>
  );
}
