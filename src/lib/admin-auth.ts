import type { AdminRole } from "@/lib/admin-user-types";

export const ADMIN_TOKEN_KEY = "artdear-admin-token";

const MOCK_JWT_SECRET = "artdear-mock-jwt-secret";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

export type JwtPayload = {
  sub: string;
  uid: string;
  role: AdminRole;
  iat: number;
  exp: number;
};

function base64UrlEncode(value: string): string {
  const base64 =
    typeof window !== "undefined"
      ? btoa(value)
      : Buffer.from(value, "utf-8").toString("base64");

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): string {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");

  return typeof window !== "undefined"
    ? atob(base64)
    : Buffer.from(base64, "base64").toString("utf-8");
}

function signMockJwt(header: string, payload: string): string {
  return base64UrlEncode(`${header}.${payload}.${MOCK_JWT_SECRET}`);
}

export function createAdminToken(session: {
  username: string;
  userId: string;
  role: AdminRole;
}): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: session.username,
      uid: session.userId,
      role: session.role,
      iat: now,
      exp: now + TOKEN_TTL_SECONDS,
    } satisfies JwtPayload)
  );
  const signature = signMockJwt(header, payload);

  return `${header}.${payload}.${signature}`;
}

export function parseAdminToken(token: string): JwtPayload | null {
  try {
    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature) return null;

    const expectedSignature = signMockJwt(header, payload);
    if (signature !== expectedSignature) return null;

    const data = JSON.parse(base64UrlDecode(payload)) as Partial<JwtPayload>;
    if (!data.sub || !data.uid || !data.role || !data.exp) return null;
    if (data.exp < Math.floor(Date.now() / 1000)) return null;

    return data as JwtPayload;
  } catch {
    return null;
  }
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getAdminUser(): string | null {
  return parseAdminToken(getAdminToken() ?? "")?.sub ?? null;
}

export function getAdminUserId(): string | null {
  return parseAdminToken(getAdminToken() ?? "")?.uid ?? null;
}

export function getAdminRole(): AdminRole | null {
  return parseAdminToken(getAdminToken() ?? "")?.role ?? null;
}

export function isSuperAdminSession(): boolean {
  return getAdminRole() === "super_admin";
}

export function isAdminAuthenticated(): boolean {
  const token = getAdminToken();
  if (!token) return false;
  return parseAdminToken(token) !== null;
}

export function setAdminSessionToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  }
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}
