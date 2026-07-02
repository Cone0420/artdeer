import { NextResponse } from "next/server";
import { createAdminToken } from "@/lib/admin-auth";
import { authenticateAdminUserWithDiagnostics } from "@/lib/db/admin-user-service";
import { toAdminUserPublic } from "@/lib/admin-user-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function shouldIncludeLoginDebug(): boolean {
  return process.env.ADMIN_LOGIN_DEBUG === "1" || process.env.VERCEL === "1";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      username?: string;
      password?: string;
    };
    const username = (body.username ?? body.id ?? "").trim().toLowerCase();
    const password = body.password ?? "";

    if (!username || !password) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 400 });
    }

    const { user, diagnostics } = authenticateAdminUserWithDiagnostics(username, password);

    console.info("[admin-login]", {
      queriedUsername: diagnostics.queriedUsername,
      userFound: diagnostics.userFound,
      isActive: diagnostics.isActive,
      bcryptCompareResult: diagnostics.bcryptCompareResult,
      failureReason: diagnostics.failureReason,
      db: diagnostics.db,
    });

    if (!user) {
      const payload: Record<string, unknown> = { error: "invalid_credentials" };
      if (shouldIncludeLoginDebug()) {
        payload.debug = diagnostics;
      }
      return NextResponse.json(payload, { status: 401 });
    }

    const token = createAdminToken({
      username: user.username,
      userId: user.id,
      role: user.role,
    });

    const payload: Record<string, unknown> = {
      token,
      user: toAdminUserPublic(user),
    };

    if (shouldIncludeLoginDebug()) {
      payload.debug = diagnostics;
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[admin-login] login_failed", error);
    return NextResponse.json({ error: "login_failed" }, { status: 500 });
  }
}
