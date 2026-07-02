import { NextResponse } from "next/server";
import { createAdminToken } from "@/lib/admin-auth";
import { authenticateAdminUser } from "@/lib/db/admin-user-service";
import { toAdminUserPublic } from "@/lib/admin-user-types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

    const user = authenticateAdminUser(username, password);
    if (!user) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    const token = createAdminToken({
      username: user.username,
      userId: user.id,
      role: user.role,
    });

    return NextResponse.json({
      token,
      user: toAdminUserPublic(user),
    });
  } catch {
    return NextResponse.json({ error: "login_failed" }, { status: 500 });
  }
}
