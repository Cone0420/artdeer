import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { VISITOR_SESSION_COOKIE, updateVisitDuration } from "@/lib/analytics";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type LeavePayload = {
  visitId?: number;
  durationSeconds?: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as LeavePayload;
    const visitId = Number(body.visitId);
    const durationSeconds = Number(body.durationSeconds);

    if (!Number.isFinite(visitId) || visitId <= 0) {
      return NextResponse.json({ updated: false, reason: "invalid_visit_id" }, { status: 400 });
    }

    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      return NextResponse.json({ updated: false, reason: "invalid_duration" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sessionId = cookieStore.get(VISITOR_SESSION_COOKIE)?.value;
    if (!sessionId) {
      return NextResponse.json({ updated: false, reason: "missing_session" }, { status: 400 });
    }

    const updated = await updateVisitDuration({
      visitId,
      sessionId,
      durationSeconds,
    });

    return NextResponse.json({ updated });
  } catch (error) {
    console.error("[analytics/leave]", error);
    return NextResponse.json({ updated: false, reason: "error" }, { status: 500 });
  }
}
