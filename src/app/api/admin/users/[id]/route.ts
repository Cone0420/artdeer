import { NextResponse } from "next/server";
import {
  getAuthorizedAdminSession,
  isSuperAdminRequest,
} from "@/lib/admin-auth-server";
import {
  countSuperAdmins,
  deleteAdminUser,
  getAdminUserById,
  updateAdminUser,
} from "@/lib/db/admin-user-service";
import type { AdminRole } from "@/lib/admin-user-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const session = getAuthorizedAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const isSelf = session.id === id;
  const isSuperAdmin = session.role === "super_admin";

  if (!isSuperAdmin && !isSelf) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
      passwordConfirm?: string;
      displayName?: string;
      role?: AdminRole;
      isActive?: boolean;
    };

    const existing = getAdminUserById(id);
    if (!existing) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const updatePayload: Parameters<typeof updateAdminUser>[1] = {};

    if (body.displayName !== undefined) {
      updatePayload.displayName = body.displayName;
    }

    if (body.password) {
      if (body.password.length < 8) {
        return NextResponse.json({ error: "password_too_short" }, { status: 400 });
      }
      if (body.password !== body.passwordConfirm) {
        return NextResponse.json({ error: "password_mismatch" }, { status: 400 });
      }
      updatePayload.password = body.password;
    }

    if (isSuperAdmin) {
      if (body.username !== undefined) {
        updatePayload.username = body.username.trim().toLowerCase();
      }
      if (body.role !== undefined) {
        updatePayload.role = body.role === "super_admin" ? "super_admin" : "admin";
      }
      if (body.isActive !== undefined) {
        updatePayload.isActive = body.isActive;
      }

      if (
        existing.role === "super_admin" &&
        updatePayload.role === "admin" &&
        countSuperAdmins(id) === 0
      ) {
        return NextResponse.json({ error: "last_super_admin" }, { status: 400 });
      }

      if (
        existing.role === "super_admin" &&
        updatePayload.isActive === false &&
        countSuperAdmins(id) === 0
      ) {
        return NextResponse.json({ error: "last_super_admin" }, { status: 400 });
      }
    }

    const user = updateAdminUser(id, updatePayload);
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof Error && error.message === "username_exists") {
      return NextResponse.json({ error: "username_exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = getAuthorizedAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!isSuperAdminRequest(request)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  if (session.id === id) {
    return NextResponse.json({ error: "cannot_delete_self" }, { status: 400 });
  }

  const existing = getAdminUserById(id);
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (existing.role === "super_admin" && countSuperAdmins(id) === 0) {
    return NextResponse.json({ error: "last_super_admin" }, { status: 400 });
  }

  try {
    deleteAdminUser(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }
}
