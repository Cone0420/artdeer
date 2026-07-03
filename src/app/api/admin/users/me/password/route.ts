import { NextResponse } from "next/server";
import { getAuthorizedAdminSession } from "@/lib/admin-auth-server";
import { changeAdminPassword } from "@/lib/db/admin-user-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getAuthorizedAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
      newPasswordConfirm?: string;
    };

    const currentPassword = body.currentPassword ?? "";
    const newPassword = body.newPassword ?? "";
    const newPasswordConfirm = body.newPasswordConfirm ?? "";

    if (!currentPassword) {
      return NextResponse.json({ error: "current_password_required" }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "password_too_short" }, { status: 400 });
    }
    if (newPassword !== newPasswordConfirm) {
      return NextResponse.json({ error: "password_mismatch" }, { status: 400 });
    }

    await changeAdminPassword(session.id, currentPassword, newPassword);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "invalid_password") {
      return NextResponse.json({ error: "invalid_password" }, { status: 401 });
    }
    return NextResponse.json({ error: "change_failed" }, { status: 500 });
  }
}
