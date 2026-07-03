import { NextResponse } from "next/server";
import { getAuthorizedAdminSession, isSuperAdminRequest } from "@/lib/admin-auth-server";
import { createAdminUser, listAdminUsers } from "@/lib/db/admin-user-service";
import type { AdminRole } from "@/lib/admin-user-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await getAuthorizedAdminSession(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ users: await listAdminUsers() });
}

export async function POST(request: Request) {
  if (!(await isSuperAdminRequest(request))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
      passwordConfirm?: string;
      displayName?: string;
      role?: AdminRole;
    };

    const username = body.username?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    const passwordConfirm = body.passwordConfirm ?? "";

    if (!username) {
      return NextResponse.json({ error: "username_required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "password_too_short" }, { status: 400 });
    }
    if (password !== passwordConfirm) {
      return NextResponse.json({ error: "password_mismatch" }, { status: 400 });
    }

    const role: AdminRole = body.role === "super_admin" ? "super_admin" : "admin";
    const user = await createAdminUser({
      username,
      password,
      displayName: body.displayName,
      role,
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "username_exists") {
      return NextResponse.json({ error: "username_exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }
}
