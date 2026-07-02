import { compareSync, hashSync } from "bcryptjs";
import { randomUUID } from "crypto";
import type { AdminRole, AdminUserPublic, AdminUserRecord } from "@/lib/admin-user-types";
import { toAdminUserPublic } from "@/lib/admin-user-types";
import type { DbPathDiagnostics } from "./db-path";
import { getAppDb, syncAppDbWrites } from "./app-db";
import { getDbPathDiagnostics } from "./db-path";

const BCRYPT_ROUNDS = 12;

function normalizeAdminUsername(username: string): string {
  return username.trim().toLowerCase();
}

function commitAdminUserWrite(): void {
  syncAppDbWrites();
}

type AdminUserRow = {
  id: string;
  username: string;
  password_hash: string;
  display_name: string | null;
  role: AdminRole;
  is_active: number;
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
    isActive: row.is_active === 1,
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

export function listAdminUsers(): AdminUserPublic[] {
  const db = getAppDb();
  const rows = db
    .prepare(
      `SELECT id, username, password_hash, display_name, role, is_active, created_at, last_login_at
       FROM admin_users
       ORDER BY datetime(created_at) ASC`
    )
    .all() as AdminUserRow[];

  return rows.map((row) => toAdminUserPublic(mapRow(row)));
}

export function getAdminUserById(id: string): AdminUserRecord | null {
  const db = getAppDb();
  const row = db
    .prepare(
      `SELECT id, username, password_hash, display_name, role, is_active, created_at, last_login_at
       FROM admin_users WHERE id = ?`
    )
    .get(id) as AdminUserRow | undefined;

  return row ? mapRow(row) : null;
}

export function getAdminUserByUsername(username: string): AdminUserRecord | null {
  const db = getAppDb();
  const normalizedUsername = normalizeAdminUsername(username);
  const row = db
    .prepare(
      `SELECT id, username, password_hash, display_name, role, is_active, created_at, last_login_at
       FROM admin_users WHERE lower(username) = ?`
    )
    .get(normalizedUsername) as AdminUserRow | undefined;

  return row ? mapRow(row) : null;
}

export type AdminAuthDiagnostics = {
  queriedUsername: string;
  userFound: boolean;
  isActive: boolean | null;
  passwordHashLength: number | null;
  bcryptCompareResult: boolean | null;
  failureReason: string | null;
  db: DbPathDiagnostics;
};

export function authenticateAdminUserWithDiagnostics(
  username: string,
  password: string
): { user: AdminUserRecord | null; diagnostics: AdminAuthDiagnostics } {
  const normalizedUsername = normalizeAdminUsername(username);
  const dbDiagnostics = getDbPathDiagnostics();
  const user = getAdminUserByUsername(normalizedUsername);

  const diagnostics: AdminAuthDiagnostics = {
    queriedUsername: normalizedUsername,
    userFound: Boolean(user),
    isActive: user?.isActive ?? null,
    passwordHashLength: user?.passwordHash.length ?? null,
    bcryptCompareResult: null,
    failureReason: null,
    db: dbDiagnostics,
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

  const db = getAppDb();
  db.prepare(`UPDATE admin_users SET last_login_at = datetime('now') WHERE id = ?`).run(user.id);
  commitAdminUserWrite();

  return { user: getAdminUserById(user.id), diagnostics };
}

export function authenticateAdminUser(username: string, password: string): AdminUserRecord | null {
  return authenticateAdminUserWithDiagnostics(username, password).user;
}

export function createAdminUser(input: {
  username: string;
  password: string;
  displayName?: string | null;
  role: AdminRole;
}): AdminUserPublic {
  const db = getAppDb();
  const username = normalizeAdminUsername(input.username);
  if (!username) throw new Error("username_required");
  if (getAdminUserByUsername(username)) throw new Error("username_exists");

  const id = randomUUID();
  db.prepare(
    `INSERT INTO admin_users (id, username, password_hash, display_name, role, is_active)
     VALUES (?, ?, ?, ?, ?, 1)`
  ).run(
    id,
    username,
    hashAdminPassword(input.password),
    input.displayName?.trim() || null,
    input.role
  );

  commitAdminUserWrite();

  const created = getAdminUserById(id);
  if (!created) throw new Error("create_failed");
  return toAdminUserPublic(created);
}

export function updateAdminUser(
  id: string,
  input: {
    username?: string;
    password?: string;
    displayName?: string | null;
    role?: AdminRole;
    isActive?: boolean;
  }
): AdminUserPublic {
  const db = getAppDb();
  const existing = getAdminUserById(id);
  if (!existing) throw new Error("not_found");

  const username =
    input.username !== undefined ? normalizeAdminUsername(input.username) : existing.username;
  if (!username) throw new Error("username_required");

  const duplicate = getAdminUserByUsername(username);
  if (duplicate && duplicate.id !== id) throw new Error("username_exists");

  const passwordHash =
    input.password && input.password.length > 0
      ? hashAdminPassword(input.password)
      : existing.passwordHash;

  const displayName =
    input.displayName !== undefined ? input.displayName?.trim() || null : existing.displayName;

  const role = input.role ?? existing.role;
  const isActive = input.isActive ?? existing.isActive;

  db.prepare(
    `UPDATE admin_users
     SET username = ?, password_hash = ?, display_name = ?, role = ?, is_active = ?
     WHERE id = ?`
  ).run(username, passwordHash, displayName, role, isActive ? 1 : 0, id);
  commitAdminUserWrite();

  const updated = getAdminUserById(id);
  if (!updated) throw new Error("update_failed");
  return toAdminUserPublic(updated);
}

export function changeAdminPassword(
  id: string,
  currentPassword: string,
  newPassword: string
): void {
  const user = getAdminUserById(id);
  if (!user) throw new Error("not_found");
  if (!verifyAdminPassword(currentPassword, user.passwordHash)) throw new Error("invalid_password");

  const db = getAppDb();
  db.prepare(`UPDATE admin_users SET password_hash = ? WHERE id = ?`).run(
    hashAdminPassword(newPassword),
    id
  );
  commitAdminUserWrite();
}

export function deleteAdminUser(id: string): void {
  const db = getAppDb();
  const result = db.prepare(`DELETE FROM admin_users WHERE id = ?`).run(id);
  if (result.changes === 0) throw new Error("not_found");
  commitAdminUserWrite();
}

export function countSuperAdmins(excludeId?: string): number {
  const db = getAppDb();
  if (excludeId) {
    const row = db
      .prepare(
        `SELECT COUNT(*) AS count FROM admin_users WHERE role = 'super_admin' AND is_active = 1 AND id != ?`
      )
      .get(excludeId) as { count: number };
    return row.count;
  }

  const row = db
    .prepare(`SELECT COUNT(*) AS count FROM admin_users WHERE role = 'super_admin' AND is_active = 1`)
    .get() as { count: number };
  return row.count;
}
