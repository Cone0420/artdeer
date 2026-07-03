import { compareSync, hashSync } from "bcryptjs";
import { randomUUID } from "crypto";
import type { AdminRole, AdminUserPublic, AdminUserRecord } from "@/lib/admin-user-types";
import { toAdminUserPublic } from "@/lib/admin-user-types";
import { getAdminDefaultPassword } from "@/lib/supabase/env";
import { getSupabaseAdmin, getSupabaseDiagnostics } from "@/lib/supabase/server";
import { assertWritableDatabase, useSupabaseDatabase } from "./provider";
import {
  authenticateAdminUserWithDiagnosticsSqlite,
  changeAdminPasswordSqlite,
  countSuperAdminsSqlite,
  createAdminUserSqlite,
  deleteAdminUserSqlite,
  getAdminUserByIdSqlite,
  getAdminUserByUsernameSqlite,
  listAdminUsersSqlite,
  updateAdminUserSqlite,
} from "./sqlite/admin-user-service";

const BCRYPT_ROUNDS = 12;

function normalizeAdminUsername(username: string): string {
  return username.trim().toLowerCase();
}

type AdminUserRow = {
  id: string;
  username: string;
  password_hash: string;
  display_name: string | null;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
};

function mapRow(row: AdminUserRow): AdminUserRecord {
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    displayName: row.display_name,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
  };
}

export function hashAdminPassword(password: string): string {
  return hashSync(password, BCRYPT_ROUNDS);
}

export function verifyAdminPassword(password: string, passwordHash: string): boolean {
  if (!passwordHash || passwordHash.length !== 60) return false;
  return compareSync(password, passwordHash);
}

async function ensureDefaultAdminUserSupabase(): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("admin_users")
    .select("*", { count: "exact", head: true });

  if (error) throw error;
  if ((count ?? 0) > 0) return;

  const { error: insertError } = await supabase.from("admin_users").insert({
    id: randomUUID(),
    username: "admin",
    password_hash: hashAdminPassword(getAdminDefaultPassword()),
    display_name: "최고 관리자",
    role: "super_admin",
    is_active: true,
  });

  if (insertError) throw insertError;
}

export type AdminAuthDiagnostics = {
  queriedUsername: string;
  userFound: boolean;
  isActive: boolean | null;
  passwordHashLength: number | null;
  bcryptCompareResult: boolean | null;
  failureReason: string | null;
  database: ReturnType<typeof getSupabaseDiagnostics> | ReturnType<
    typeof import("./db-path").getDbPathDiagnostics
  >;
};

export async function listAdminUsers(): Promise<AdminUserPublic[]> {
  if (!useSupabaseDatabase()) {
    return listAdminUsersSqlite();
  }

  await ensureDefaultAdminUserSupabase();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, username, password_hash, display_name, role, is_active, created_at, last_login_at")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => toAdminUserPublic(mapRow(row)));
}

export async function getAdminUserById(id: string): Promise<AdminUserRecord | null> {
  if (!useSupabaseDatabase()) {
    return getAdminUserByIdSqlite(id);
  }

  await ensureDefaultAdminUserSupabase();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, username, password_hash, display_name, role, is_active, created_at, last_login_at")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapRow(data) : null;
}

export async function getAdminUserByUsername(username: string): Promise<AdminUserRecord | null> {
  if (!useSupabaseDatabase()) {
    return getAdminUserByUsernameSqlite(username);
  }

  await ensureDefaultAdminUserSupabase();
  const supabase = getSupabaseAdmin();
  const normalizedUsername = normalizeAdminUsername(username);
  const { data, error } = await supabase
    .from("admin_users")
    .select("id, username, password_hash, display_name, role, is_active, created_at, last_login_at")
    .eq("username", normalizedUsername)
    .maybeSingle();

  if (error) throw error;
  return data ? mapRow(data) : null;
}

export async function authenticateAdminUserWithDiagnostics(
  username: string,
  password: string
): Promise<{ user: AdminUserRecord | null; diagnostics: AdminAuthDiagnostics }> {
  if (!useSupabaseDatabase()) {
    return authenticateAdminUserWithDiagnosticsSqlite(username, password);
  }

  const normalizedUsername = normalizeAdminUsername(username);
  const user = await getAdminUserByUsername(normalizedUsername);

  const diagnostics: AdminAuthDiagnostics = {
    queriedUsername: normalizedUsername,
    userFound: Boolean(user),
    isActive: user?.isActive ?? null,
    passwordHashLength: user?.passwordHash.length ?? null,
    bcryptCompareResult: null,
    failureReason: null,
    database: getSupabaseDiagnostics(),
  };

  if (!user) {
    diagnostics.failureReason = "user_not_found";
    return { user: null, diagnostics };
  }

  if (!user.isActive) {
    diagnostics.failureReason = "user_inactive";
    return { user: null, diagnostics };
  }

  const bcryptCompareResult = verifyAdminPassword(password, user.passwordHash);
  diagnostics.bcryptCompareResult = bcryptCompareResult;

  if (!bcryptCompareResult) {
    diagnostics.failureReason = "password_mismatch";
    return { user: null, diagnostics };
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("admin_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) throw error;

  return { user: await getAdminUserById(user.id), diagnostics };
}

export async function authenticateAdminUser(
  username: string,
  password: string
): Promise<AdminUserRecord | null> {
  return (await authenticateAdminUserWithDiagnostics(username, password)).user;
}

export async function createAdminUser(input: {
  username: string;
  password: string;
  displayName?: string | null;
  role: AdminRole;
}): Promise<AdminUserPublic> {
  if (!useSupabaseDatabase()) {
    assertWritableDatabase("createAdminUser");
    return createAdminUserSqlite(input);
  }

  const username = normalizeAdminUsername(input.username);
  if (!username) throw new Error("username_required");
  if (await getAdminUserByUsername(username)) throw new Error("username_exists");

  const id = randomUUID();
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("admin_users").insert({
    id,
    username,
    password_hash: hashAdminPassword(input.password),
    display_name: input.displayName?.trim() || null,
    role: input.role,
    is_active: true,
  });

  if (error) throw error;

  const created = await getAdminUserById(id);
  if (!created) throw new Error("create_failed");
  return toAdminUserPublic(created);
}

export async function updateAdminUser(
  id: string,
  input: {
    username?: string;
    password?: string;
    displayName?: string | null;
    role?: AdminRole;
    isActive?: boolean;
  }
): Promise<AdminUserPublic> {
  if (!useSupabaseDatabase()) {
    assertWritableDatabase("updateAdminUser");
    return updateAdminUserSqlite(id, input);
  }

  const existing = await getAdminUserById(id);
  if (!existing) throw new Error("not_found");

  const username =
    input.username !== undefined ? normalizeAdminUsername(input.username) : existing.username;
  if (!username) throw new Error("username_required");

  const duplicate = await getAdminUserByUsername(username);
  if (duplicate && duplicate.id !== id) throw new Error("username_exists");

  const passwordHash =
    input.password && input.password.length > 0
      ? hashAdminPassword(input.password)
      : existing.passwordHash;

  const displayName =
    input.displayName !== undefined ? input.displayName?.trim() || null : existing.displayName;

  const role = input.role ?? existing.role;
  const isActive = input.isActive ?? existing.isActive;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("admin_users")
    .update({
      username,
      password_hash: passwordHash,
      display_name: displayName,
      role,
      is_active: isActive,
    })
    .eq("id", id);

  if (error) throw error;

  const updated = await getAdminUserById(id);
  if (!updated) throw new Error("update_failed");
  return toAdminUserPublic(updated);
}

export async function changeAdminPassword(
  id: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  if (!useSupabaseDatabase()) {
    assertWritableDatabase("changeAdminPassword");
    changeAdminPasswordSqlite(id, currentPassword, newPassword);
    return;
  }

  const user = await getAdminUserById(id);
  if (!user) throw new Error("not_found");
  if (!verifyAdminPassword(currentPassword, user.passwordHash)) throw new Error("invalid_password");

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("admin_users")
    .update({ password_hash: hashAdminPassword(newPassword) })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteAdminUser(id: string): Promise<void> {
  if (!useSupabaseDatabase()) {
    assertWritableDatabase("deleteAdminUser");
    deleteAdminUserSqlite(id);
    return;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("admin_users").delete().eq("id", id).select("id");

  if (error) throw error;
  if (!data?.length) throw new Error("not_found");
}

export async function countSuperAdmins(excludeId?: string): Promise<number> {
  if (!useSupabaseDatabase()) {
    return countSuperAdminsSqlite(excludeId);
  }

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("admin_users")
    .select("*", { count: "exact", head: true })
    .eq("role", "super_admin")
    .eq("is_active", true);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}
