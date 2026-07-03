import { NextResponse } from "next/server";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth-server";
import { getAnalyticsStats } from "@/lib/analytics";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await isAuthorizedAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = await getAnalyticsStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("[analytics/stats]", error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
