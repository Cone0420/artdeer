import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getClientIp } from "@/lib/admin-auth-server";
import {
  VISITOR_SESSION_COOKIE,
  VISITOR_SESSION_MAX_AGE,
  getRecentVisitId,
  hashIpAddress,
  insertVisitor,
} from "@/lib/analytics";

type VisitPayload = {
  path?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as VisitPayload;
    const path = body.path ?? "/";

    if (path !== "/") {
      return NextResponse.json({ recorded: false, reason: "unsupported_path" });
    }

    const cookieStore = await cookies();
    let sessionId = cookieStore.get(VISITOR_SESSION_COOKIE)?.value;
    const isNewSession = !sessionId;

    if (!sessionId) {
      sessionId = randomUUID();
    }

    const recentVisitId = getRecentVisitId(sessionId);
    if (recentVisitId) {
      const response = NextResponse.json({
        recorded: false,
        visitId: recentVisitId,
        reason: "deduplicated",
      });

      if (isNewSession) {
        response.cookies.set(VISITOR_SESSION_COOKIE, sessionId, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: VISITOR_SESSION_MAX_AGE,
          path: "/",
        });
      }

      return response;
    }

    const userAgent = request.headers.get("user-agent");
    const visitId = insertVisitor({
      sessionId,
      ipHash: hashIpAddress(getClientIp(request)),
      userAgent,
      path,
    });

    const response = NextResponse.json({ recorded: true, visitId });
    if (isNewSession) {
      response.cookies.set(VISITOR_SESSION_COOKIE, sessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: VISITOR_SESSION_MAX_AGE,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("[analytics/visit]", error);
    return NextResponse.json({ recorded: false, reason: "error" }, { status: 500 });
  }
}
