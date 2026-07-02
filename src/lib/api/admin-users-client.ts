import { getAdminToken } from "@/lib/admin-auth";
import type { AdminRole, AdminUserPublic } from "@/lib/admin-user-types";

function authHeaders(): HeadersInit {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? "request_failed";
  } catch {
    return "request_failed";
  }
}

export async function fetchAdminUsers(): Promise<AdminUserPublic[]> {
  const response = await fetch("/api/admin/users", {
    cache: "no-store",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { users: AdminUserPublic[] };
  return data.users;
}

export async function createAdminUserApi(input: {
  username: string;
  password: string;
  passwordConfirm: string;
  displayName?: string;
  role: AdminRole;
}): Promise<AdminUserPublic> {
  const response = await fetch("/api/admin/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { user: AdminUserPublic };
  return data.user;
}

export async function updateAdminUserApi(
  id: string,
  input: {
    username?: string;
    password?: string;
    passwordConfirm?: string;
    displayName?: string | null;
    role?: AdminRole;
    isActive?: boolean;
  }
): Promise<AdminUserPublic> {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { user: AdminUserPublic };
  return data.user;
}

export async function deleteAdminUserApi(id: string): Promise<void> {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}

export async function changeMyAdminPasswordApi(input: {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}): Promise<void> {
  const response = await fetch("/api/admin/users/me/password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}

export async function loginAdminApi(id: string, password: string): Promise<{
  token: string;
  user: AdminUserPublic;
}> {
  const response = await fetch("/api/admin/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, password }),
  });

  if (!response.ok) {
    throw new Error("invalid_credentials");
  }

  return (await response.json()) as { token: string; user: AdminUserPublic };
}

export function adminApiErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    invalid_credentials: "아이디 또는 비밀번호가 올바르지 않습니다.",
    username_required: "아이디를 입력해주세요.",
    username_exists: "이미 사용 중인 아이디입니다.",
    password_too_short: "비밀번호는 8자 이상이어야 합니다.",
    password_mismatch: "비밀번호 확인이 일치하지 않습니다.",
    current_password_required: "현재 비밀번호를 입력해주세요.",
    invalid_password: "현재 비밀번호가 올바르지 않습니다.",
    cannot_delete_self: "본인 계정은 삭제할 수 없습니다.",
    last_super_admin: "최소 1명의 활성 최고 관리자가 필요합니다.",
    forbidden: "권한이 없습니다.",
    unauthorized: "로그인이 필요합니다.",
  };

  return messages[code] ?? "요청에 실패했습니다.";
}
