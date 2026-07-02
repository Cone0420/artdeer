export type AdminRole = "super_admin" | "admin";

export type AdminUserRecord = {
  id: string;
  username: string;
  passwordHash: string;
  displayName: string | null;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

export type AdminUserPublic = {
  id: string;
  username: string;
  displayName: string | null;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

export type AdminSession = {
  id: string;
  username: string;
  role: AdminRole;
  displayName: string | null;
};

export function adminRoleLabel(role: AdminRole): string {
  return role === "super_admin" ? "최고 관리자" : "관리자";
}

export function toAdminUserPublic(user: AdminUserRecord): AdminUserPublic {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}
