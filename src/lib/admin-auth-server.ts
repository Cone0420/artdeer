import { parseAdminToken } from "@/lib/admin-auth";
import type { AdminSession } from "@/lib/admin-user-types";
import { getAdminUserById } from "@/lib/db/admin-user-service";

export function getAuthorizedAdminSession(request: Request): AdminSession | null {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return null;

  const payload = parseAdminToken(token);
  if (!payload) return null;

  const user = getAdminUserById(payload.uid);
  if (!user || !user.isActive) return null;

  return {
    id: user.id,
    username: user.username,
    role: user.role,
    displayName: user.displayName,
  };
}

export function isAuthorizedAdminRequest(request: Request): boolean {
  return getAuthorizedAdminSession(request) !== null;
}

export function isSuperAdminRequest(request: Request): boolean {
  return getAuthorizedAdminSession(request)?.role === "super_admin";
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}
